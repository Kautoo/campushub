import { NextResponse } from "next/server";
import { z } from "zod";
import { ordersController, paypalConfigured } from "@/lib/paypal";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import {
  orders,
  orderItems,
  transactions,
  registrations,
  notifications,
} from "@/lib/db/repo";

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
    await orders.updateStatus(order.id, session.orgIds, {
      status: "paid",
      paypal_capture_id: captureRef?.id ?? null,
    });

    await transactions.insert({
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
    const registrationIds = await orderItems.listTicketRegistrationIds(order.id);

    if (registrationIds.length > 0) {
      await registrations.confirmByIds(registrationIds, order.paypal_order_id);
    }

    await notifications.insert({
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
