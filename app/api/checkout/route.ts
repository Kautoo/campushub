import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkoutSchema } from "@/lib/validation";
import { getDbSafe } from "@/lib/db/safe";
import { query } from "@/lib/db";
import type { OrderRow } from "@/lib/db/repo";

/**
 * Guest checkout: validates items/stock/prices SERVER-SIDE via the
 * place_order RPC (atomic stock decrement), returns the DB order.
 * Client prices are never trusted. No auth here — checkout is anonymous
 * by design. The RPC is security definer; the org is part of the request
 * payload and validated inside the function.
 */
export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let order: OrderRow;
  try {
    const rows = await query<OrderRow>(
      "select * from public.place_order($1::uuid, $2, $3, $4::jsonb)",
      [
        parsed.data.org_id,
        parsed.data.customer_name,
        parsed.data.customer_email,
        JSON.stringify(parsed.data.items),
      ],
    );
    order = rows[0];
  } catch (err) {
    // RPC raises user-facing stock/availability errors
    const message = (err as Error).message ?? "order_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json({ error: "order_failed" }, { status: 400 });
  }

  // New order = sold stock changed; expire tagged storefront data now so
  // the next storefront render refetches (Next 16 requires a cacheLife
  // profile; expire:0 = no stale window).
  revalidateTag("storefront", { expire: 0 });

  return NextResponse.json({ order }, { status: 201 });
}
