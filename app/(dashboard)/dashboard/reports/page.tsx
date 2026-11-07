import { redirect } from "next/navigation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { ReportPanel } from "@/components/workspaces/report-panel";

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
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="reports" />;

  const [{ data: { user } }, { data: reports }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("reports")
      .select("id, type, file_url, status, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  if (!user) redirect("/login");

  const rows = (reports ?? []) as ReportRow[];

  // Fresh 24h signed URLs for ready rows (stored file_url is the bucket
  // path) — signed in parallel; URL lifetime is independent per row.
  const readyRows = rows.filter((row) => row.status === "ready" && row.file_url);
  const signedUrls = await Promise.all(
    readyRows.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from("report-exports")
        .createSignedUrl(row.file_url as string, 60 * 60);
      return [row.id, signed?.signedUrl] as const;
    }),
  );
  const downloadUrls = new Map<string, string>();
  for (const [id, url] of signedUrls) {
    if (url) downloadUrls.set(id, url);
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="description"
        title="Reports"
        subtitle="CSV exports of your commerce and event data"
      />

      <ReportPanel />

      <section>
        <h3 className="text-headline-sm text-ink mb-3">Recent reports</h3>
        {rows.length === 0 ? (
          <EmptyState
            icon="description"
            title="No reports yet"
            body="Generate your first CSV export above — it will be listed here."
          />
        ) : (
          <ul className="divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest">
            {rows.map((row) => {
              const url = downloadUrls.get(row.id);
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <span className="material-symbols-outlined text-[20px] text-muted">
                    {row.type === "orders"
                      ? "receipt_long"
                      : row.type === "transactions"
                        ? "credit_card"
                        : "how_to_reg"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-medium text-ink">
                      {row.type}.csv
                    </p>
                    <p className="text-label-md text-muted">
                      {new Date(row.created_at).toLocaleString("en-MY")}
                    </p>
                  </div>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  {url ? (
                    <a
                      href={url}
                      download={`${row.type}.csv`}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-outline-variant px-3 text-label-md font-semibold text-ink-variant transition hover:border-secondary hover:text-secondary"
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
