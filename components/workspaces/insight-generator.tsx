"use client";

import { useState } from "react";
import { BorderBeam } from "@/components/magicui";
import { Badge } from "@/components/ui/badge";

type Kind = "summary" | "anomaly" | "recommendation";

const CARDS: {
  kind: Kind;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  badge: string;
  btnClass: string;
}[] = [
  {
    kind: "summary",
    title: "Executive Summary",
    subtitle: "Real revenue, AOV, and top ticket velocity",
    icon: "auto_awesome",
    accentColor: "border-primary/40",
    badge: "Financial Health",
    btnClass:
      "bg-primary text-on-primary hover:opacity-95 shadow-xs",
  },
  {
    kind: "anomaly",
    title: "Anomaly & Risk Radar",
    subtitle: "Stock out risks, stalled tiers, low margins",
    icon: "warning",
    accentColor: "border-warning/40",
    badge: "Risk Radar",
    btnClass:
      "bg-warning text-on-warning hover:opacity-95 shadow-xs",
  },
  {
    kind: "recommendation",
    title: "Strategic Growth",
    subtitle: "Actionable pricing, bundle & restocking strategy",
    icon: "lightbulb",
    accentColor: "border-secondary/40",
    badge: "Optimization",
    btnClass:
      "bg-secondary text-on-secondary hover:opacity-95 shadow-xs",
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
  const [copiedKind, setCopiedKind] = useState<Kind | null>(null);

  async function copyText(text: string, kind: Kind) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKind(kind);
      setTimeout(() => setCopiedKind(null), 2000);
    } catch {}
  }

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
          setError("AI Commerce Agent is offline or not configured.");
        } else {
          setError(json.error ?? "ai_error");
        }
        return;
      }
      setResults((r) => ({ ...r, [kind]: json.response as string }));
    } catch {
      setError("Analysis generation failed. Check AI configuration or try again.");
    } finally {
      setBusy(null);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-3xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <p className="text-body-sm text-on-surface-variant">
          {notice ?? "Create your organization first to generate grounded intelligence."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-outline-variant/45 bg-surface-lowest p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/35">
        <div>
          <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
            Grounded Intelligence Actions
          </span>
          <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
            Instant Executive Diagnostic Briefs
          </h2>
        </div>
        <Badge tone="teal">Computed from live PostgreSQL data</Badge>
      </div>

      {/* Generator Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARDS.map((c) => {
          const isAnalyzing = busy === c.kind;
          const hasResult = Boolean(results[c.kind]);
          return (
            <div
              key={c.kind}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all shadow-2xs hover:shadow-xs ${
                hasResult
                  ? "bg-surface-low/80 border-primary/40 ring-1 ring-primary/20"
                  : "bg-surface-low/40 border-outline-variant/50 hover:bg-surface-low/70"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">
                      {c.icon}
                    </span>
                  </div>
                  <Badge tone={c.kind === "anomaly" ? "warning" : "teal"}>
                    {c.badge}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-label-lg font-bold text-on-surface">
                    {c.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                    {c.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void generate(c.kind)}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-label-md font-bold transition-all cursor-pointer ${
                  c.btnClass
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAnalyzing ? "hourglass_top" : hasResult ? "refresh" : "play_arrow"}
                </span>
                <span>
                  {isAnalyzing
                    ? "Generating…"
                    : hasResult
                      ? "Regenerate Brief"
                      : "Generate Brief"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-body-sm text-error flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Generated Result Briefs */}
      {Object.keys(results).length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3 pt-2">
          {CARDS.map((c) =>
            results[c.kind] ? (
              <div
                key={c.kind}
                className={`relative overflow-hidden rounded-2xl border ${c.accentColor} bg-surface-low/90 p-5 shadow-xs space-y-3`}
              >
                <BorderBeam size={90} duration={8} />
                <div className="flex items-center justify-between pb-2.5 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {c.icon}
                    </span>
                    <h4 className="text-label-md font-bold text-on-surface">
                      {c.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyText(results[c.kind]!, c.kind)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {copiedKind === c.kind ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKind === c.kind ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                  {results[c.kind]}
                </p>
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
