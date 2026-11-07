import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { buildMetricsPack } from "@/lib/metrics";

/**
 * Metrics pack: real aggregates for one org, computed with RLS-scoped reads.
 * This is the ONLY data source the AI may use (grounding contract).
 */
const bodySchema = z.object({
  window_days: z.coerce.number().int().min(7).max(365).default(30),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const windowDays = parsed.success ? parsed.data.window_days : 30;

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .limit(1);
  const orgId = orgs?.[0]?.id;
  if (!orgId) return NextResponse.json({ error: "no_org" }, { status: 400 });

  const pack = await buildMetricsPack(orgId, windowDays);
  if (!pack) return NextResponse.json({ error: "pack_failed" }, { status: 500 });

  return NextResponse.json(pack);
}
