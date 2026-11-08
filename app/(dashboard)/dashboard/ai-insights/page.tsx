import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { InsightsChat } from "@/components/workspaces/insights-chat";
import { InsightGenerator } from "@/components/workspaces/insight-generator";
import { AnimatedBeamDemo } from "@/components/workspaces/insights-diagram";
import { aiConfigured, aiModelId } from "@/lib/ai";
import { hasChannel3 } from "@/lib/channel3";
import { MarketDiscovery } from "@/components/workspaces/market-discovery";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { aiInsights } from "@/lib/db/repo";

export const metadata = { title: "AI Insights — CampusHub 2.0" };

export default async function AiInsightsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="AI insights" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const recent = await aiInsights.listRecent(session.orgIds, 5);

  const aiReady = aiConfigured();
  const orgReady = session.orgIds.length > 0;

  return (
    <div className="space-y-space-lg">
      <SectionHeader
        icon="auto_awesome"
        title="AI Commerce Intelligence"
        subtitle={`Turn transaction flow into actionable insights · model ${aiModelId()}`}
        actions={
          <Badge tone={aiReady ? "success" : "warning"}>
            {aiReady ? "gateway connected" : "not configured"}
          </Badge>
        }
      />

      <InsightGenerator
        disabled={!aiReady || !orgReady || !session}
        notice={
          !orgReady
            ? "Create your organization first — insights need data."
            : "AI gateway is not configured. Set AI_BASE_URL and AI_API_KEY in the environment (see README). No insights are generated or faked until then."
        }
      />

      <div className="grid gap-space-lg lg:grid-cols-2">
        <InsightsChat
          disabled={!aiReady || !orgReady || !session}
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
            <div className="rounded-xl bg-surface-container-low p-space-lg">
              <p className="text-label-md text-on-surface-variant">Market discovery</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Channel3 integration is hidden until CHANNEL3_API_KEY is set
                (see README).
              </p>
            </div>
          )}
        </div>
      </div>

      <section>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Recent insights</h3>
        {(recent).length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Nothing yet — generate a summary or ask a question above.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((i) => (
              <li
                key={i.id}
                className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={i.kind === "chat" ? "neutral" : "teal"}>
                    {i.kind}
                  </Badge>
                  <span className="text-label-sm text-on-surface-variant">
                    {new Date(i.created_at).toLocaleString("en-MY")} · {i.model}
                  </span>
                </div>
                {i.prompt ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-1">
                    Q: {i.prompt}
                  </p>
                ) : null}
                <p className="text-body-md text-on-surface mt-1 line-clamp-4 whitespace-pre-wrap">
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
