import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";
import { ordersController, paypalConfigured } from "@/lib/paypal";
import { getDbSafe } from "@/lib/db/safe";
import { query } from "@/lib/db";
import { orders, type OrderRow } from "@/lib/db/repo";

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
                  status: z.string().optional(),
                }),
              )
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
 * verified transaction, confirms ticket registrations, and emits an organizer notification.
 * Works seamlessly for both guest student checkouts and organizer dashboard testing.
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

  // Look up order directly by ID
  const orderRes = await query<OrderRow>(
    `select id, org_id, order_number, total_cents, currency, status, paypal_order_id
     from public.orders
     where id = $1::uuid limit 1`,
    [parsed.data.order_id],
  );
  const order = orderRes[0];

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

    // Atomic settlement in one transaction
    await orders.markPaidViaPaypal(
      order.id,
      captureRef?.id ?? null,
      order.total_cents,
      order.currency,
      order.org_id,
      order.paypal_order_id,
      order.order_number,
    );

    revalidateTag("storefront", { expire: 0 });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/transactions");

    return NextResponse.json({ status: "completed", order_id: order.id });
  } catch (err) {
    console.error("paypal capture failed", err);
    return NextResponse.json({ error: "paypal_error" }, { status: 502 });
  }
}
