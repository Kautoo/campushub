import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
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
 * Creates a PayPal order for an existing DB order.
 * Amount comes from the DB order total — never the client.
 * Session-scoped: the DB order is read through the caller's org scope.
 */
export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const order = await orders.getById(parsed.data.order_id, session.orgIds);

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

    await orders.updateFields(order.id, session.orgIds, {
      paypal_order_id: paypalOrderId,
    });

    return NextResponse.json({ paypal_order_id: paypalOrderId });
  } catch (err) {
    console.error("paypal create-order failed", err);
    return NextResponse.json({ error: "paypal_error" }, { status: 502 });
  }
}
