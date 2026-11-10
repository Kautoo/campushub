import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyWebhookSignature } from "@/lib/paypal";
import { getDbSafe } from "@/lib/db/safe";
import {
  webhookEvents,
  orders,
  transactions,
  notifications,
} from "@/lib/db/repo";

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
 * PayPal webhook receiver. Server-to-server (no user session — webhook
 * events are written directly, replacing the service-role client):
 * 1. verify transmission signature (400 when verification fails)
 * 2. dedupe by provider_event_id (webhook_events.provider_event_id unique)
 * 3. handle APPROVED / CAPTURE.COMPLETED / CAPTURE.REFUNDED idempotently
 */
export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
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

  const parsedEvent = eventSchema.safeParse(body);
  if (!parsedEvent.success) {
    return NextResponse.json({ error: "invalid_event_structure" }, { status: 400 });
  }
  const event = parsedEvent.data;

  // Dedupe: unique provider_event_id
  const { duplicate } = await webhookEvents.insert({
    provider: "paypal",
    event_type: event.event_type,
    provider_event_id: event.id,
    payload: event,
  });
  if (duplicate) {
    // Already processed (or in flight) — idempotent ack
    return NextResponse.json({ status: "duplicate" });
  }

  const parsedResource = event.resource
    ? captureResourceSchema.safeParse(event.resource)
    : null;
  const resource = parsedResource?.success ? parsedResource.data : null;

  try {
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED": {
        const dbOrderId = resource?.custom_id;
        if (dbOrderId) {
          await orders.updateFields(dbOrderId, null, {
            paypal_order_id: resource!.id,
            status: "pending",
          });
        }
        break;
      }
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Locate the DB order via paypal_order_id (custom_id fallback above).
        const paypalOrderId =
          resource?.supplementary_data?.related_ids?.order_id ?? resource?.id;
        const matchedOrders = paypalOrderId
          ? await orders.getByPaypalOrderId(paypalOrderId)
          : [];
        for (const o of matchedOrders) {
          if (o.status !== "pending") continue; // capture API already marked it paid
          await orders.updateStatus(o.id, null, { status: "paid" });
          await transactions.insert({
            org_id: o.org_id,
            order_id: o.id,
            provider: "paypal",
            provider_ref: resource?.id,
            type: "payment",
            amount_cents: o.total_cents,
            currency: o.currency,
            status: "completed",
            verified: true,
            raw: event as Record<string, unknown>,
          });
          await notifications.insert({
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
        const txns = resource?.id
          ? await transactions.findPaymentByRef(resource.id)
          : [];
        for (const t of txns) {
          if (!t.order_id) continue;
          const existing = await transactions.findRefundForOrder(t.order_id);
          if (existing) continue; // idempotent
          await orders.updateStatus(t.order_id, null, { status: "refunded" });
          await transactions.insert({
            org_id: t.org_id,
            order_id: t.order_id,
            provider: "paypal",
            provider_ref: resource?.id,
            type: "refund",
            amount_cents: t.amount_cents,
            currency: t.currency,
            status: "completed",
            verified: true,
            raw: event as Record<string, unknown>,
          });
          await notifications.insert({
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

    await webhookEvents.markProcessed(event.id);

    return NextResponse.json({ status: "processed" });
  } catch (err) {
    console.error("webhook processing failed", err);
    await webhookEvents.markFailed(event.id);
    return NextResponse.json({ error: "processing_error" }, { status: 500 });
  }
}
