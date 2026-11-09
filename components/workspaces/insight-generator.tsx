"use client";

import { useState } from "react";
import { BorderBeam } from "@/components/magicui";

type Kind = "summary" | "anomaly" | "recommendation";

const CARDS: {
  kind: Kind;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  btnClass: string;
}[] = [
  {
    kind: "summary",
    title: "Commerce Summary",
    subtitle: "Real revenue, AOV, and top ticket velocity",
    icon: "auto_awesome",
    accentColor: "border-primary/30",
    btnClass:
      "bg-primary text-on-primary hover:opacity-90 border-primary/50 shadow-xs",
  },
  {
    kind: "anomaly",
    title: "Anomaly Scan",
    subtitle: "Stock out risks, stalled tiers, low margins",
    icon: "warning",
    accentColor: "border-warning/30",
    btnClass:
      "bg-[#b3261e] text-white hover:bg-[#8c1d18] border-[#b3261e]/50 shadow-xs",
  },
  {
    kind: "recommendation",
    title: "Smart Recommendations",
    subtitle: "Actionable pricing, bundle & restocking strategy",
    icon: "lightbulb",
    accentColor: "border-secondary/40",
    btnClass:
      "bg-[#006a60] text-white hover:bg-[#005249] border-[#006a60]/50 shadow-xs",
  },
];

/** One-click grounded insight cards (summary / anomaly / recommendation). */
export function InsightGenerator({
  disabled,
  notice,
}: {
  disabled?: boolean;
  notice?: string;
}) {
  const [busy, setBusy] = useState<Kind | null>(null);
  const [results, setResults] = useState<Partial<Record<Kind, string>>>({});
  const [error, setError] = useState<string | null>(null);

  async function generate(kind: Kind) {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "ai_not_configured") {
          setError("Astropods Agent is offline or AI gateway is not configured.");
        } else {
          setError(json.error ?? "ai_error");
        }
        return;
      }
      setResults((r) => ({ ...r, [kind]: json.response as string }));
    } catch {
      setError("Analysis generation failed. Check connection to Astropods.");
    } finally {
      setBusy(null);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <p className="text-body-sm text-on-surface-variant">
          {notice ?? "Create your organization first to generate grounded intelligence."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/35">
        <div>
          <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
            Grounded AI Actions
          </span>
          <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
            Instant Metric Briefs
          </h2>
        </div>
        <span className="text-label-sm text-on-surface-variant">
          Computed from live SQL aggregates · Zero fabricated figures
        </span>
      </div>

      {/* High-Contrast Interactive Generator Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CARDS.map((c) => {
          const isAnalyzing = busy === c.kind;
          return (
            <button
              key={c.kind}
              type="button"
              disabled={busy !== null}
              onClick={() => void generate(c.kind)}
              className={
                "focus-aura relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98] disabled:opacity-60 " +
                c.btnClass
              }
            >
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-white">
                  {isAnalyzing ? "hourglass_top" : c.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-label-md font-bold text-white">
                  {isAnalyzing ? "Analyzing Live Ledger…" : c.title}
                </p>
                <p className="text-[11px] text-white/80 truncate mt-0.5">
                  {c.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-body-sm text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Generated Result Briefs */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        {CARDS.map((c) =>
          results[c.kind] ? (
            <div
              key={c.kind}
              className={`relative overflow-hidden rounded-2xl border ${c.accentColor} bg-surface-low/80 p-5 shadow-xs`}
            >
              <BorderBeam size={80} duration={8} />
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  {c.icon}
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  {c.title}
                </h3>
              </div>
              <p className="text-body-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {results[c.kind]}
              </p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
