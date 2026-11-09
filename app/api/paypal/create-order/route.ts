import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSafe } from "@/lib/db/safe";
import { query } from "@/lib/db";
import {
  ordersController,
  paypalConfigured,
  paypalCurrency,
  centsToPaypalAmount,
} from "@/lib/paypal";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { orders } from "@/lib/db/repo";

const bodySchema = z.object({
  order_id: z.string().uuid(),
});

/**
 * Creates a PayPal Orders v2 record for an existing pending DB order.
 * Anonymous / guest friendly: verified strictly against the pending order in Postgres.
 * Amount comes from the server-validated DB order total — never the client.
 */
export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const order = await orders.getPendingOrder(parsed.data.order_id);

  if (!order) {
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
            description: `CampusHub Order ${order.order_number}`,
            amount: {
              currencyCode: order.currency || paypalCurrency(),
              value: centsToPaypalAmount(order.total_cents),
            },
          },
        ],
      },
    });

    const responseSchema = z.object({ id: z.string() });
    const parsedResult = responseSchema.parse(result);
    const paypalOrderId = parsedResult.id;

    await query(
      `update public.orders
       set paypal_order_id = $2
       where id = $1::uuid and status = 'pending'`,
      [order.id, paypalOrderId],
    );

    return NextResponse.json({ paypal_order_id: paypalOrderId });
  } catch (err) {
    console.error("paypal create-order failed", err);
    return NextResponse.json({ error: "paypal_error" }, { status: 502 });
  }
}
