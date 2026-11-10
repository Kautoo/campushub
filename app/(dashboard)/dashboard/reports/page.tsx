import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { ReportPanel } from "@/components/workspaces/report-panel";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { reports } from "@/lib/db/repo";

export const metadata = { title: "Audit Reports & Exports — CampusHub" };

type ReportRow = {
  id: string;
  type: string;
  file_url: string | null;
  status: string;
  created_at: string;
};

function statusTone(status: string): "success" | "warning" | "error" {
  if (status === "ready") return "success";
  if (status === "pending") return "warning";
  return "error";
}

export default async function ReportsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="reports" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const rows = (await reports.list([session.activeOrgId], 25)) as ReportRow[];

  const downloadUrls = new Map<string, string>();
  for (const row of rows) {
    if (row.status === "ready" && row.file_url) {
      downloadUrls.set(row.id, row.file_url);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="description"
        eyebrow="Bursary Compliance & Data Exports"
        title="Audit Reports & CSV Export Center"
        subtitle="Generate HMAC token-signed CSV exports stored in the Postgres file vault for university bursary reconciliation, PayPal audit trails, and attendee rosters."
        actions={
          <Badge tone="teal" icon="lock">
            24h HMAC-Signed Links
          </Badge>
        }
      />

      <ReportPanel />

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div>
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
              Generated Archives
            </span>
            <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
              Recent CSV Exports
            </h3>
          </div>
          <Badge tone="neutral">{rows.length} archives</Badge>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon="description"
            title="No reports generated yet"
            body="Select a dataset above to generate your first signed CSV export."
          />
        ) : (
          <ul className="divide-y divide-outline-variant/40 overflow-hidden rounded-xl border border-outline-variant/45 bg-surface-lowest">
            {rows.map((row) => {
              const url = downloadUrls.get(row.id);
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 hover:bg-surface-low/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-secondary-container/45 text-on-secondary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[19px]">
                        {row.type === "orders"
                          ? "receipt_long"
                          : row.type === "transactions"
                            ? "credit_card"
                            : "how_to_reg"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-md font-semibold text-on-surface font-mono">
                        campushub-{row.type}.csv
                      </p>
                      <p className="text-body-sm text-on-surface-variant tabular-nums">
                        Generated{" "}
                        {new Date(row.created_at).toLocaleString("en-MY", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                    {url ? (
                      <a
                        href={url}
                        download={`campushub-${row.type}.csv`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-lowest px-3.5 text-label-md font-semibold text-primary transition hover:bg-surface-low"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          download
                        </span>
                        Download CSV
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
