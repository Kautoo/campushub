import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { AiInsightsWorkspace } from "@/components/workspaces/ai-insights-workspace";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { aiInsights, orgs } from "@/lib/db/repo";

export const metadata = { title: "AI Commerce Intelligence — CampusHub" };

export default async function AiInsightsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="AI insights" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const [recent, org] = await Promise.all([
    aiInsights.listRecent([session.activeOrgId], 20),
    orgs.getById(session.activeOrgId),
  ]);

  const orgReady = Boolean(session.activeOrgId);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="auto_awesome"
        eyebrow="Autonomous Commerce Intelligence"
        title="AI Commerce Analyst Studio"
        subtitle={`Grounded commerce intelligence for ${org?.name ?? "your society"} — answers, anomaly scans, and market price comparisons strictly computed from live PostgreSQL telemetry.`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="teal" icon="verified">
              AI Agent Active
            </Badge>
            <Badge tone="primary" icon="database">
              Zero-PII Metrics Pack
            </Badge>
          </div>
        }
      />

      <AiInsightsWorkspace
        orgReady={orgReady}
        hasSession={Boolean(session)}
        recent={recent}
      />
    </div>
  );
}
