import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import {
  ordersController,
  paypalConfigured,
  paypalCurrency,
  centsToPaypalAmount,
} from "@/lib/paypal";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";

const bodySchema = z.object({
  order_id: z.string().uuid(),
});

/**
 * Creates a PayPal order for an existing DB order.
 * Amount comes from the DB order total — never the client.
 * Stays on the cookie-aware server client: `orders` RLS is org-member-only,
 * so an anon public client would read nothing and break the payment path.
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
    .select("id, order_number, total_cents, currency, status, customer_email")
    .eq("id", parsed.data.order_id)
    .single();

  if (!order || order.status !== "pending") {
    return NextResponse.json({ error: "order_not_payable" }, { status: 400 });
  }

  try {
    const { result } = await ordersController().createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            referenceId: order.id,
            customId: order.order_number,
            amount: {
              currencyCode: paypalCurrency(),
              value: centsToPaypalAmount(order.total_cents),
            },
          },
        ],
      },
    });

    const responseSchema = z.object({ id: z.string() });
    const parsedResult = responseSchema.parse(result);
    const paypalOrderId = parsedResult.id;

    await supabase
      .from("orders")
      .update({ paypal_order_id: paypalOrderId })
      .eq("id", order.id);

    return NextResponse.json({ paypal_order_id: paypalOrderId });
  } catch (err) {
    console.error("paypal create-order failed", err);
    return NextResponse.json({ error: "paypal_error" }, { status: 502 });
  }
}
