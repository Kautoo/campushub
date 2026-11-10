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
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      r.prompt?.toLowerCase().includes(q) ||
      r.response?.toLowerCase().includes(q) ||
      r.kind.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative pb-24 space-y-6">
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
        <section aria-label="Quick Grounded Briefs" className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                Executive Diagnostics &amp; Strategic Briefs
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                One-click analytical briefs generated strictly from your database numbers.
              </p>
            </div>
            <Badge tone="teal">Instant Generation</Badge>
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
            <div className="lg:col-span-7">
              <MarketDiscovery />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <AnimatedBeamDemo />
              <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    verified
                  </span>
                  <h4 className="text-label-lg font-bold text-on-surface">
                    Channel3 Collegiate Index
                  </h4>
                </div>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Real-time merchandise retail benchmarking compares your student society gear against collegiate market quotes. Active whenever product queries are scanned.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Tab 4: Grounded Intelligence Audit Ledger */}
      {activeTab === "audit" ? (
        <section aria-label="Audit Ledger History" className="rounded-3xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Telemetry Ledger
                </span>
                <Badge tone="neutral">{recent.length} saved records</Badge>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
                Grounded AI Query Audit Trail
              </h3>
            </div>

            <div className="flex items-center gap-2 max-w-xs w-full">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-on-surface-variant">
                  search
                </span>
                <input
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter audit log..."
                  className="h-10 w-full rounded-xl border border-outline-variant/60 bg-surface-low pl-9 pr-3 text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {filteredAudit.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-[36px] opacity-40">
                history
              </span>
              <p className="text-body-md font-medium">No recorded insights match your filter.</p>
              <p className="text-xs text-on-surface-variant/70">
                Ask a question in AI Chat or generate a Quick Brief to append an audit entry.
              </p>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {filteredAudit.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-outline-variant/40 bg-surface-low/50 hover:bg-surface-low/80 p-5 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Badge tone={item.kind === "chat" ? "primary" : "teal"}>
                        {item.kind.toUpperCase()}
                      </Badge>
                      {item.model ? (
                        <span className="font-mono text-[11px] text-on-surface-variant bg-surface-lowest px-2 py-0.5 rounded border border-outline-variant/40">
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {copiedId === item.id ? "check" : "content_copy"}
                        </span>
                        <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {item.prompt ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Prompt Query:
                      </span>
                      <p className="text-body-sm font-semibold text-primary">
                        {item.prompt}
                      </p>
                    </div>
                  ) : null}

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Grounded Answer:
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

      {/* Floating Bottom Menu for Changing Views */}
      <nav
        aria-label="AI Workspace Navigation"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="flex items-center gap-1 rounded-full border border-outline-variant/70 bg-surface-lowest/90 backdrop-blur-2xl p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          {MENU_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-label-md font-bold transition-all cursor-pointer ${
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
