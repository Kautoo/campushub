import { NextResponse, connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabaseEnv, getPool } from "@/lib/db";

/**
 * Public storefront config: demo org id + PayPal client id presence.
 * The org lookup goes through the cached pool query and shares the
 * "storefront" cache tag so checkout revalidation refreshes it.
 */
async function getDemoOrgId(): Promise<string | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("storefront");

  try {
    const pool = getPool();
    const res = await pool.query<{ id: string }>(
      `select id from public.organizations
       order by created_at asc
       limit 1`,
    );
    return res.rows[0]?.id ?? null;
  } catch (err) {
    // Schema not applied yet (fresh database), auth problem, or transient
    // connection failure — degrade instead of failing the build/prerender.
    console.error("store-config: org lookup unavailable", err);
    return null;
  }
}

export async function GET() {
  await connection();
  if (!hasDatabaseEnv()) {
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
