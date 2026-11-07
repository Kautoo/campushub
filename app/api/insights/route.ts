import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { aiConfigured, aiModel, aiModelId, GROUNDED_SYSTEM_PROMPT } from "@/lib/ai";
import { buildMetricsPack } from "@/lib/metrics";
import { generateText } from "ai";


const bodySchema = z.object({
  kind: z.enum(["summary", "anomaly", "recommendation"]).default("summary"),
  window_days: z.coerce.number().int().min(7).max(365).default(30),
});

const PROMPTS: Record<string, string> = {
  summary:
    "Write a weekly commerce summary for this organizer based ONLY on the metrics pack below.",
  anomaly:
    "Identify anomalies and risks (refunds, sell-through outliers, stock, revenue dips) based ONLY on the metrics pack below. If none are visible, say so plainly.",
  recommendation:
    "Give 3 concrete, data-grounded recommendations (pricing, bundling, restock, promotion) based ONLY on the metrics pack below. Cite the exact numbers you rely on.",
};

/** Generate a grounded insight and persist it to ai_insights. */
export async function POST(request: Request) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
  }
  const supabase = await getSupabaseServerSafe();
  if (!supabase) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { kind, window_days } = parsed.data;

  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
  const orgId = orgs?.[0]?.id;
  if (!orgId) return NextResponse.json({ error: "no_org" }, { status: 400 });

  const pack = await buildMetricsPack(orgId, window_days);
  if (!pack) return NextResponse.json({ error: "pack_failed" }, { status: 500 });

  try {
    const { text } = await generateText({
      model: aiModel(),
      system: GROUNDED_SYSTEM_PROMPT,
      prompt: `${PROMPTS[kind]}\n\nMetrics pack (integer cents, MYR):\n${JSON.stringify(pack)}`,
    });

    await supabase.from("ai_insights").insert({
      org_id: orgId,
      kind,
      prompt: PROMPTS[kind],
      response: text,
      model: aiModelId(),
      data_window: { window_days, since: pack.window.since },
    });

    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("insight generation failed", err);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
