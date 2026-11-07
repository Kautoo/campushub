import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { ordersController, paypalConfigured } from "@/lib/paypal";

const bodySchema = z.object({
  order_id: z.string().uuid(),
});

const captureResultSchema = z.object({
  status: z.string(),
  purchaseUnits: z
    .array(
      z.object({
        payments: z
          .object({
            captures: z
              .array(
                z.object({
                  id: z.string(),
                  status: z.string(),
                  amount: z
                    .object({ value: z.string(), currencyCode: z.string() })
                    .optional(),
                }),
              )
              .min(1)
              .optional(),
          })
          .optional(),
      }),
    )
    .min(1)
    .optional(),
});

/**
 * Captures an approved PayPal order. Verifies COMPLETED status against the
 * PayPal API response before flipping the DB order to `paid`, records a
 * verified transaction, and confirms ticket registrations.
 * Stays on the cookie-aware server client: orders/registrations/transactions
 * RLS is org-member-only, so an anon public client would be blocked.
 */
export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }
  const supabase = await getSupabaseServerSafe();
  if (!supabase) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, org_id, order_number, status, paypal_order_id, total_cents, currency",
    )
    .eq("id", parsed.data.order_id)
    .single();

  if (!order || !order.paypal_order_id) {
    return NextResponse.json({ error: "order_not_capturable" }, { status: 400 });
  }
  if (order.status === "paid" || order.status === "fulfilled") {
    // Idempotent: already captured
    return NextResponse.json({ status: "already_paid", order_id: order.id });
  }

  try {
    const { statusCode, result } = await ordersController().captureOrder({
      id: order.paypal_order_id,
      prefer: "return=minimal",
    });
    const capture = captureResultSchema.parse(result);
    const captureRef = capture.purchaseUnits?.[0]?.payments?.captures?.[0];

    if (statusCode !== 201 || capture.status !== "COMPLETED") {
      console.error("paypal capture not completed", statusCode, capture.status);
      return NextResponse.json({ error: "capture_incomplete" }, { status: 402 });
    }

    // Flip order to paid + record verified transaction
    await supabase
      .from("orders")
      .update({
        status: "paid",
        paypal_capture_id: captureRef?.id ?? null,
      })
      .eq("id", order.id);

    await supabase.from("transactions").insert({
      org_id: order.org_id,
      order_id: order.id,
      provider: "paypal",
      provider_ref: captureRef?.id ?? order.paypal_order_id,
      type: "payment",
      amount_cents: order.total_cents,
      currency: order.currency,
      status: "completed",
      verified: true,
      raw: { capture_status: capture.status, capture_id: captureRef?.id },
    });

    // Confirm ticket registrations tied to this order
    const { data: items } = await supabase
      .from("order_items")
      .select("registration_id")
      .eq("order_id", order.id)
      .eq("kind", "ticket")
      .not("registration_id", "is", null);

    const registrationIds = (items ?? [])
      .map((i) => i.registration_id)
      .filter((id): id is string => Boolean(id));

    if (registrationIds.length > 0) {
      await supabase
        .from("registrations")
        .update({ status: "confirmed", paypal_order_id: order.paypal_order_id })
        .in("id", registrationIds);
    }

    await supabase.from("notifications").insert({
      org_id: order.org_id,
      type: "order",
      title: "New paid order",
      body: `${order.order_number} was paid via PayPal.`,
      link: "/dashboard/orders",
    });

    return NextResponse.json({ status: "completed", order_id: order.id });
  } catch (err) {
    console.error("paypal capture failed", err);
    return NextResponse.json({ error: "paypal_error" }, { status: 502 });
  }
}
