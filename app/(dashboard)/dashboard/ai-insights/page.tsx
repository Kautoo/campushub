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
export const metadata = { title: "AI Commerce Intelligence — CampusHub" };
export default async function AiInsightsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="AI insights" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const recent = await aiInsights.listRecent(session.orgIds, 5);

  const aiReady = aiConfigured();
  const orgReady = session.orgIds.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="auto_awesome"
        eyebrow="Autonomous Astropods Intelligence"
        title="Astropods Commerce Analyst"
        subtitle="Autonomous grounded intelligence powered exclusively by the Astropods Agent (campushub-analyst) — every metric brief and answer is computed strictly from live Postgres aggregates."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="teal" icon="verified">
              Astropods Agent Active
            </Badge>
            <Badge tone="primary" icon="database">
              Zero-PII Metrics Pack
            </Badge>
          </div>
        }
      />

      <InsightGenerator
        disabled={!orgReady || !session}
        notice={
          !orgReady
            ? "Create your organization first — insights need data."
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <InsightsChat
            disabled={!orgReady || !session}
            notice={
              !orgReady
                ? "Create your organization first."
                : undefined
            }
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <AnimatedBeamDemo />
          {hasChannel3() ? (
            <MarketDiscovery />
          ) : (
            <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  travel_explore
                </span>
                <p className="text-headline-sm font-bold text-on-surface">
                  Channel3 Market Discovery
                </p>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                External collegiate merchandise benchmarking unlocks when{" "}
                <code className="font-mono text-xs bg-surface-low px-1.5 py-0.5 rounded">
                  CHANNEL3_API_KEY
                </code>{" "}
                is configured in your environment.
              </p>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div>
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
              Persistence Log
            </span>
            <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
              Recent Grounded Insights Audit Trail
            </h3>
          </div>
          <Badge tone="neutral">{recent.length} stored</Badge>
        </div>

        {recent.length === 0 ? (
          <p className="text-body-md text-on-surface-variant py-4">
            No persisted insights yet — generate a summary card or ask a question above to record an audit entry.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((i) => (
              <li
                key={i.id}
                className="rounded-xl border border-outline-variant/40 bg-surface-low/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={i.kind === "chat" ? "neutral" : "teal"}>
                      {i.kind}
                    </Badge>
                    {i.model ? (
                      <span className="font-mono text-[11px] text-on-surface-variant">
                        {i.model}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-label-sm text-on-surface-variant tabular-nums">
                    {new Date(i.created_at).toLocaleString("en-MY")}
                  </span>
                </div>
                {i.prompt ? (
                  <p className="text-body-sm font-semibold text-primary mt-2">
                    Prompt: {i.prompt}
                  </p>
                ) : null}
                <p className="text-body-md text-on-surface mt-1.5 whitespace-pre-wrap leading-relaxed">
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
