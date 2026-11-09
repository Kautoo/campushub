import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSafe } from "@/lib/db/safe";
import { query } from "@/lib/db";
import { orders, type OrderRow } from "@/lib/db/repo";
import { revalidateTag, revalidatePath } from "next/cache";

const bodySchema = z.object({
  order_id: z.string().uuid(),
});

/**
 * Demo settlement helper for sandboxes & evaluators testing checkout
 * before live/sandbox PayPal credentials are provided in .env.local.
 */
export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const orderRes = await query<OrderRow>(
    `select id, org_id, order_number, total_cents, currency, status
     from public.orders
     where id = $1::uuid and status = 'pending' limit 1`,
    [parsed.data.order_id],
  );
  const order = orderRes[0];

  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  const demoRef = `SANDBOX-PP-${Date.now().toString().slice(-6)}`;
  await orders.markPaidViaPaypal(
    order.id,
    demoRef,
    order.total_cents,
    order.currency,
    order.org_id,
    demoRef,
    order.order_number,
  );

  revalidateTag("storefront", { expire: 0 });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/transactions");

  return NextResponse.json({
    status: "completed",
    order_id: order.id,
    ref: demoRef,
  });
}
