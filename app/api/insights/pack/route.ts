import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMetricsPack } from "@/lib/metrics";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";

/**
 * Metrics pack: real aggregates for one org, computed with repo-scoped reads.
 * This is the ONLY data source the AI may use (grounding contract).
 */
const bodySchema = z.object({
  window_days: z.coerce.number().int().min(7).max(365).default(30),
});

export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const windowDays = parsed.success ? parsed.data.window_days : 30;

  const orgId = session.orgIds[0];
  if (!orgId) return NextResponse.json({ error: "no_org" }, { status: 400 });

  const pack = await buildMetricsPack(orgId, windowDays);
  if (!pack) return NextResponse.json({ error: "pack_failed" }, { status: 500 });

  return NextResponse.json(pack);
}
