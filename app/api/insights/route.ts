import { NextResponse } from "next/server";
import { z } from "zod";
import { runAstropodsAgent, aiModelId } from "@/lib/ai";
import { buildMetricsPack } from "@/lib/metrics";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { aiInsights } from "@/lib/db/repo";

const bodySchema = z.object({
  kind: z.enum(["summary", "anomaly", "recommendation"]).default("summary"),
  window_days: z.coerce.number().int().min(7).max(365).default(30),
});

const PROMPTS: Record<string, string> = {
  summary:
    "Write an executive commerce summary for this organizer based strictly on the live metrics pack.",
  anomaly:
    "Identify anomalies and risks (refunds, sell-through outliers, stock, revenue dips) based strictly on the metrics pack.",
  recommendation:
    "Give 3 concrete, data-grounded recommendations (pricing, bundling, restock, promotion) based strictly on the metrics pack.",
};

/** Generate an Astropods grounded insight and persist it to ai_insights. */
export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { kind, window_days } = parsed.data;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/ch-active-org=([a-f0-9-]+)/i);
  const activeOrgCookie = match ? match[1] : null;
  const orgId =
    activeOrgCookie && session.orgIds.includes(activeOrgCookie)
      ? activeOrgCookie
      : session.orgIds[0];
  if (!orgId) return NextResponse.json({ error: "no_org" }, { status: 400 });

  const pack = await buildMetricsPack(orgId, window_days);
  if (!pack) return NextResponse.json({ error: "pack_failed" }, { status: 500 });

  try {
    const text = await runAstropodsAgent(PROMPTS[kind], pack as never);

    await aiInsights.insert({
      org_id: orgId,
      kind,
      prompt: PROMPTS[kind],
      response: text,
      model: aiModelId(),
      data_window: { window_days, since: pack.window.since },
    });

    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("Astropods insight generation failed", err);
    return NextResponse.json({ error: "astropods_error" }, { status: 502 });
  }
}
