"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { InsightsChat } from "@/components/workspaces/insights-chat";
import { InsightGenerator } from "@/components/workspaces/insight-generator";
import { MarketDiscovery } from "@/components/workspaces/market-discovery";
import { AnimatedBeamDemo } from "@/components/workspaces/insights-diagram";
import type { AiInsightRow } from "@/lib/db/repo";

export type InsightTab = "chat" | "briefs" | "radar" | "audit";

const MENU_ITEMS: {
  id: InsightTab;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "chat",
    label: "AI Chat",
    icon: "forum",
    desc: "Conversational Analyst",
  },
  {
    id: "briefs",
    label: "Quick Briefs",
    icon: "insights",
    desc: "1-Click Diagnostics",
  },
  {
    id: "radar",
    label: "Market Radar",
    icon: "travel_explore",
    desc: "Channel3 Price Benchmarks",
  },
  {
    id: "audit",
    label: "Audit Ledger",
    icon: "history_edu",
    desc: "Persistence History",
  },
];

export function AiInsightsWorkspace({
  orgReady,
  hasSession,
  recent,
}: {
  orgReady: boolean;
  hasSession: boolean;
  recent: AiInsightRow[];
}) {
  const [activeTab, setActiveTab] = useState<InsightTab>("chat");
  const [auditFilter, setAuditFilter] = useState<"all" | "chat" | "summary" | "anomaly" | "recommendation">("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }

  const filteredAudit = recent.filter((r) => {
    if (auditFilter !== "all" && r.kind !== auditFilter) return false;
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      r.prompt?.toLowerCase().includes(q) ||
      r.response?.toLowerCase().includes(q) ||
      r.kind.toLowerCase().includes(q)
    );
  });

  const chatCount = recent.filter((r) => r.kind === "chat").length;
  const briefsCount = recent.filter((r) => r.kind !== "chat").length;

  return (
    <div className="relative pb-28 space-y-6">
      {/* Tab 1: AI Chat Canvas (ChatGPT Style) */}
      {activeTab === "chat" ? (
        <section aria-label="AI Chat Workspace" className="space-y-4">
          <InsightsChat
            disabled={!orgReady || !hasSession}
            notice={
              !orgReady
                ? "Create your organization first."
                : undefined
            }
          />
        </section>
      ) : null}

      {/* Tab 2: One-Click Quick Briefs */}
      {activeTab === "briefs" ? (
        <section aria-label="Quick Grounded Briefs" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Diagnostic Studio
                </span>
                <Badge tone="teal">Live Telemetry</Badge>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface mt-0.5">
                Executive Metric Briefs &amp; Strategy
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                1-click grounded analytical briefs generated strictly from your PostgreSQL database aggregates.
              </p>
            </div>
          </div>
          <InsightGenerator
            disabled={!orgReady || !hasSession}
            notice={
              !orgReady
                ? "Create your organization first — insights need data."
                : undefined
            }
          />
        </section>
      ) : null}

      {/* Tab 3: Channel3 Market Intelligence & Data Radar */}
      {activeTab === "radar" ? (
        <section aria-label="Market Intelligence Radar" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <MarketDiscovery />
            </div>
            <div className="lg:col-span-4 space-y-5">
              <AnimatedBeamDemo />
              <div className="rounded-3xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">
                      price_check
                    </span>
                  </div>
                  <div>
                    <h4 className="text-label-lg font-bold text-on-surface">
                      Collegiate Price Radar
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      Automatic margin &amp; savings index
                    </p>
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Channel3 scans commercial collegiate retail indices to benchmark your student society merchandise prices against off-campus bookstore quotes.
                </p>
                <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Price Telemetry:</span>
                  <span className="font-semibold text-secondary">Active &amp; Grounded</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Tab 4: Grounded Intelligence Audit Ledger */}
      {activeTab === "audit" ? (
        <section aria-label="Audit Ledger History" className="rounded-3xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header & Stat Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Telemetry Ledger
                </span>
                <Badge tone="teal">100% Zero-PII</Badge>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface mt-0.5">
                Grounded AI Query Audit Trail
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Immutable audit log of all questions, answers, and model executions.
              </p>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: `All (${recent.length})` },
                { id: "chat", label: `Chat (${chatCount})` },
                { id: "summary", label: "Summaries" },
                { id: "anomaly", label: "Anomalies" },
                { id: "recommendation", label: "Strategy" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAuditFilter(f.id as typeof auditFilter)}
                  className={`px-3 py-1.5 rounded-full text-label-sm font-semibold transition-all cursor-pointer ${
                    auditFilter === f.id
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search by prompt keywords or response text..."
              className="h-11 w-full rounded-2xl border border-outline-variant/60 bg-surface-low pl-10 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:bg-surface-lowest transition-colors"
            />
          </div>

          {filteredAudit.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-[42px] opacity-35">
                history_edu
              </span>
              <p className="text-body-md font-semibold text-on-surface">No audit records match your filter.</p>
              <p className="text-xs text-on-surface-variant/70 max-w-sm mx-auto">
                Ask questions in the AI Chat tab or generate a Quick Brief to append entries to this ledger.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredAudit.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-outline-variant/45 bg-surface-low/50 hover:bg-surface-low/80 p-5 sm:p-6 transition-all space-y-3.5 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={item.kind === "chat" ? "primary" : item.kind === "anomaly" ? "warning" : "teal"}>
                        {item.kind.toUpperCase()}
                      </Badge>
                      {item.model ? (
                        <span className="font-mono text-[11px] text-on-surface-variant bg-surface-lowest px-2 py-0.5 rounded-md border border-outline-variant/40">
                          {item.model}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-label-sm text-on-surface-variant tabular-nums">
                        {new Date(item.created_at).toLocaleString("en-MY", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copyText(item.response ?? "", item.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-surface-lowest border border-transparent hover:border-outline-variant/40 transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === item.id ? "check" : "content_copy"}
                        </span>
                        <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {item.prompt ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Organizer Query:
                      </span>
                      <p className="text-body-md font-semibold text-primary">
                        {item.prompt}
                      </p>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Grounded Response:
                    </span>
                    <p className="text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
                      {item.response}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* Floating Bottom Menu for Changing Views — Centered relative to main content (accounting for desktop sidebar) */}
      <nav
        aria-label="AI Workspace Navigation"
        className="fixed bottom-6 left-0 lg:left-72 right-0 flex justify-center z-40 pointer-events-none px-4"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-outline-variant/70 bg-surface-lowest/95 backdrop-blur-2xl p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          {MENU_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-label-md font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-on-primary shadow-xs scale-102"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.id === "audit" && recent.length > 0 ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-on-primary text-primary"
                        : "bg-surface-container text-on-surface"
                    }`}
                  >
                    {recent.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
