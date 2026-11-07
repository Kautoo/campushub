import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { InsightsChat } from "@/components/workspaces/insights-chat";
import { InsightGenerator } from "@/components/workspaces/insight-generator";
import { AnimatedBeamDemo } from "@/components/workspaces/insights-diagram";
import { aiConfigured, aiModelId } from "@/lib/ai";
import { hasChannel3 } from "@/lib/channel3";
import { MarketDiscovery } from "@/components/workspaces/market-discovery";

export const metadata = { title: "AI Insights — CampusHub 2.0" };

export default async function AiInsightsPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="AI insights" />;

  const [{ data: { user } }, [recentRes, orgsRes]] = await Promise.all([
    supabase.auth.getUser(),
    Promise.all([
      supabase
        .from("ai_insights")
        .select("id, kind, prompt, response, model, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("organizations").select("id").limit(1),
    ]),
  ]);

  const aiReady = aiConfigured();
  const orgReady = Boolean(orgsRes.data?.[0]);

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="auto_awesome"
        title="AI Commerce Intelligence"
        subtitle={`Grounded in live aggregates · model ${aiModelId()}`}
        actions={
          <Badge tone={aiReady ? "success" : "warning"}>
            {aiReady ? "gateway connected" : "not configured"}
          </Badge>
        }
      />

      <InsightGenerator
        disabled={!aiReady || !orgReady || !user}
        notice={
          !orgReady
            ? "Create your organization first — insights need data."
            : "AI gateway is not configured. Set AI_BASE_URL and AI_API_KEY in the environment (see README). No insights are generated or faked until then."
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsChat
          disabled={!aiReady || !orgReady || !user}
          notice={
            !orgReady
              ? "Create your organization first."
              : "Chat unlocks once AI_BASE_URL and AI_API_KEY are set (see README)."
          }
        />
        <div className="space-y-6">
          <AnimatedBeamDemo />
          {hasChannel3() ? (
            <MarketDiscovery />
          ) : (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-lowest p-5">
              <p className="text-label-md text-muted">Market discovery</p>
              <p className="text-body-sm text-muted mt-1">
                Channel3 integration is hidden until CHANNEL3_API_KEY is set
                (see README).
              </p>
            </div>
          )}
        </div>
      </div>

      <section>
        <h3 className="text-headline-sm text-ink mb-3">Recent insights</h3>
        {(recentRes.data ?? []).length === 0 ? (
          <p className="text-body-sm text-muted">
            Nothing yet — generate a summary or ask a question above.
          </p>
        ) : (
          <ul className="space-y-3">
            {(recentRes.data ?? []).map((i) => (
              <li
                key={i.id}
                className="rounded-xl border border-outline-variant bg-surface-lowest p-4"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={i.kind === "chat" ? "neutral" : "teal"}>
                    {i.kind}
                  </Badge>
                  <span className="text-label-sm text-muted">
                    {new Date(i.created_at).toLocaleString("en-MY")} · {i.model}
                  </span>
                </div>
                {i.prompt ? (
                  <p className="text-body-sm text-muted mt-2 line-clamp-1">
                    Q: {i.prompt}
                  </p>
                ) : null}
                <p className="text-body-md text-ink mt-1 line-clamp-4 whitespace-pre-wrap">
                  {i.response}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
