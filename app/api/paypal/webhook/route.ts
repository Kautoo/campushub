import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminSafe } from "@/lib/supabase/safe";
import { verifyWebhookSignature } from "@/lib/paypal";

const eventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z.record(z.string(), z.unknown()).optional(),
});

const captureResourceSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  supplementary_data: z
    .object({
      related_ids: z.object({ order_id: z.string().optional() }).optional(),
    })
    .optional(),
  custom_id: z.string().optional(),
});

/**
 * PayPal webhook receiver. Service-role only:
 * 1. verify transmission signature (400 when verification fails)
 * 2. dedupe by provider_event_id (webhook_events.provider_event_id unique)
 * 3. handle APPROVED / CAPTURE.COMPLETED / CAPTURE.REFUNDED idempotently
 */
export async function POST(request: Request) {
  const admin = getSupabaseAdminSafe();
  if (!admin) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const raw = await request.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const verification = await verifyWebhookSignature(request.headers, body);
  if (verification === "FAILURE") {
    // Tampered or unknown sender: store nothing.
    return NextResponse.json({ error: "signature_invalid" }, { status: 400 });
  }
  if (verification === "UNCONFIGURED") {
    console.error("webhook received without PAYPAL_WEBHOOK_ID; rejecting");
    return NextResponse.json({ error: "webhook_unconfigured" }, { status: 503 });
  }

  const event = eventSchema.parse(body);

  // Dedupe: unique provider_event_id
  const { error: insertErr } = await admin.from("webhook_events").insert({
    provider: "paypal",
    event_type: event.event_type,
    provider_event_id: event.id,
    payload: event,
    status: "received",
  });
  if (insertErr) {
    // Already processed (or in flight) — idempotent ack
    return NextResponse.json({ status: "duplicate" });
  }

  const resource = event.resource
    ? captureResourceSchema.parse(event.resource)
    : null;

  try {
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED": {
        const dbOrderId = resource?.custom_id;
        if (dbOrderId) {
          await admin
            .from("orders")
            .update({ paypal_order_id: resource!.id })
            .eq("id", dbOrderId)
            .eq("status", "pending");
        }
        break;
      }
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Locate the DB order via paypal_order_id (custom_id fallback above).
        const paypalOrderId =
          resource?.supplementary_data?.related_ids?.order_id ?? resource?.id;
        const { data: orders } = await admin
          .from("orders")
          .select("id, org_id, status, total_cents, currency")
          .eq("paypal_order_id", paypalOrderId);
        for (const o of orders ?? []) {
          if (o.status !== "pending") continue; // capture API already marked it paid
          await admin.from("orders").update({ status: "paid" }).eq("id", o.id);
          await admin.from("transactions").insert({
            org_id: o.org_id,
            order_id: o.id,
            provider: "paypal",
            provider_ref: resource?.id,
            type: "payment",
            amount_cents: o.total_cents,
            currency: o.currency,
            status: "completed",
            verified: true,
            raw: event,
          });
          await admin.from("notifications").insert({
            org_id: o.org_id,
            type: "order",
            title: "New paid order (webhook)",
            body: `Payment capture ${resource?.id} completed.`,
            link: "/dashboard/orders",
          });
        }
        break;
      }
      case "PAYMENT.CAPTURE.REFUNDED": {
        const { data: txns } = await admin
          .from("transactions")
          .select("id, order_id, org_id, amount_cents, currency, provider_ref")
          .eq("provider_ref", resource?.id)
          .eq("type", "payment");
        for (const t of txns ?? []) {
          if (!t.order_id) continue;
          const { data: existing } = await admin
            .from("transactions")
            .select("id")
            .eq("order_id", t.order_id)
            .eq("type", "refund")
            .limit(1);
          if (existing && existing.length > 0) continue; // idempotent
          await admin
            .from("orders")
            .update({ status: "refunded" })
            .eq("id", t.order_id);
          await admin.from("transactions").insert({
            org_id: t.org_id,
            order_id: t.order_id,
            provider: "paypal",
            provider_ref: resource?.id,
            type: "refund",
            amount_cents: t.amount_cents,
            currency: t.currency,
            status: "completed",
            verified: true,
            raw: event,
          });
          await admin.from("notifications").insert({
            org_id: t.org_id,
            type: "system",
            title: "Refund issued",
            body: `Order refunded via PayPal (${resource?.id}).`,
            link: "/dashboard/transactions",
          });
        }
        break;
      }
      default:
        break; // stored for audit, no action
    }

    await admin
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("provider_event_id", event.id);

    return NextResponse.json({ status: "processed" });
  } catch (err) {
    console.error("webhook processing failed", err);
    await admin
      .from("webhook_events")
      .update({ status: "failed" })
      .eq("provider_event_id", event.id);
    // 200 to stop retries for unhandleable payloads; failure is recorded.
    return NextResponse.json({ status: "recorded_failure" });
  }
}
