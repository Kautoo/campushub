import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkoutSchema } from "@/lib/validation";
import { getSupabasePublicSafe } from "@/lib/supabase/safe";

/**
 * Guest checkout: validates items/stock/prices SERVER-SIDE via the
 * place_order RPC (atomic stock decrement), returns the DB order.
 * Client prices are never trusted. Guest = anon public client; the RPC
 * is security definer so RLS does not block it. No auth.getUser here —
 * checkout is anonymous by design.
 */
export async function POST(request: Request) {
  const supabase = getSupabasePublicSafe();
  if (!supabase) {
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

  const { data, error } = await supabase.rpc("place_order", {
    p_org: parsed.data.org_id,
    p_customer_name: parsed.data.customer_name,
    p_customer_email: parsed.data.customer_email,
    p_items: parsed.data.items,
  });

  if (error) {
    // RPC raises user-facing stock/availability errors
    const message = error.message ?? "order_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // New order = sold stock changed; expire tagged storefront data now so
  // the next storefront render refetches (Next 16 requires a cacheLife
  // profile; expire:0 = no stale window).
  revalidateTag("storefront", { expire: 0 });

  return NextResponse.json({ order: data }, { status: 201 });
}
