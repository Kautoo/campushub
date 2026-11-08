import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { ReportPanel } from "@/components/workspaces/report-panel";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { reports } from "@/lib/db/repo";

export const metadata = { title: "Reports — CampusHub 2.0" };

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

  const rows = (await reports.list(session.orgIds, 25)) as ReportRow[];

  // Stored file_url is already a token-signed /api/files/<id> route URL
  // (24h expiry embedded at generation time) — no re-signing needed.
  const downloadUrls = new Map<string, string>();
  for (const row of rows) {
    if (row.status === "ready" && row.file_url) {
      downloadUrls.set(row.id, row.file_url);
    }
  }

  return (
    <div className="space-y-space-lg">
      <SectionHeader
        icon="description"
        title="Reports & Export Management"
        subtitle="Generate institutional audit reports, reconcile PayPal settlements, analyze ticket registration velocity, and export verified datasets."
      />

      <ReportPanel />

      <section>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Recent reports</h3>
        {rows.length === 0 ? (
          <EmptyState
            icon="description"
            title="No reports yet"
            body="Generate your first CSV export above — it will be listed here."
          />
        ) : (
          <ul className="divide-y divide-outline-variant overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            {rows.map((row) => {
              const url = downloadUrls.get(row.id);
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                    {row.type === "orders"
                      ? "receipt_long"
                      : row.type === "transactions"
                        ? "credit_card"
                        : "how_to_reg"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-medium text-on-surface">
                      {row.type}.csv
                    </p>
                    <p className="text-label-md text-on-surface-variant">
                      {new Date(row.created_at).toLocaleString("en-MY")}
                    </p>
                  </div>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  {url ? (
                    <a
                      href={url}
                      download={`${row.type}.csv`}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-outline-variant px-3 text-label-md font-semibold text-on-surface-variant transition hover:border-secondary hover:text-secondary"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        download
                      </span>
                      Download
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
