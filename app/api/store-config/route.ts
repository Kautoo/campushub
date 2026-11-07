import { NextResponse } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabaseEnv } from "@/lib/supabase/safe";
import { supabasePublic } from "@/lib/supabase/client";

/**
 * Public storefront config: demo org id + PayPal client id presence.
 * The org lookup goes through the cached, cookie-less anon client and
 * shares the "storefront" cache tag so checkout revalidation refreshes it.
 */
async function getDemoOrgId(): Promise<string | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("storefront");

  const supabase = supabasePublic();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1);

  return org?.[0]?.id ?? null;
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }
  const orgId = await getDemoOrgId();

  return NextResponse.json({
    org_id: orgId,
    paypal_client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? null,
    paypal_configured: Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
    ),
    currency: process.env.PAYPAL_CURRENCY ?? "MYR",
  });
}
