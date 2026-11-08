"use client";

import { useState } from "react";

const REPORT_TYPES = [
  { value: "orders", label: "Orders", icon: "receipt_long" },
  { value: "transactions", label: "Transactions", icon: "credit_card" },
  { value: "registrations", label: "Registrations", icon: "how_to_reg" },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]["value"];

const NOTICES: Record<string, string> = {
  service_role_missing:
    "Report backend unavailable — could not store the export. Try again.",
  storage_unavailable:
    "Storage is unavailable — the file store insert failed. Check the database connection and try again.",
  no_organization:
    "No organization found for your account — set up your org first.",
  unauthorized: "Your session expired — sign in again.",
  store_unavailable: "Database is not configured (DATABASE_URL missing).",
};

/** Report type selector + generate button; renders the signed download link. */
export function ReportPanel() {
  const [type, setType] = useState<ReportType>("orders");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        setError(
          (data.error && (NOTICES[data.error] ?? data.error)) ??
            "Report generation failed.",
        );
        return;
      }
      setResult({ url: data.url });
    } catch {
      setError("Report generation failed — check your connection.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
      <h3 className="text-headline-sm text-ink mb-1">Generate a report</h3>
      <p className="text-body-sm text-muted mb-4">
        Export your organization’s data as CSV. Files are stored for 24 hours.
      </p>

      <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label="Report type">
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.value}
            type="button"
            role="radio"
            aria-checked={type === rt.value}
            onClick={() => setType(rt.value)}
            className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-label-lg font-semibold transition ${
              type === rt.value
                ? "border-primary bg-primary text-white dark:text-on-primary-container"
                : "border-outline-variant bg-surface-lowest text-ink-variant hover:border-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {rt.icon}
            </span>
            {rt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-secondary px-5 text-label-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">
            {pending ? "progress_activity" : "download"}
          </span>
          {pending ? "Generating…" : "Generate"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-warning-container px-3 py-2 text-body-sm text-warning">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-success-container px-3 py-2 text-body-sm text-success">
          <span className="material-symbols-outlined text-[18px]">
            check_circle
          </span>
          Report ready —{" "}
          <a
            href={result.url}
            className="font-semibold underline"
            download
          >
            download {type}.csv
          </a>
        </p>
      ) : null}
    </section>
  );
}
