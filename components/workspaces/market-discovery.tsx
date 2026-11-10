"use client";

import { useEffect, useState } from "react";
import { MoneyDisplay } from "@/components/ui/currency-context";
import { Badge } from "@/components/ui/badge";

type Result = {
  title: string;
  price_cents: number | null;
  url: string;
  source: string;
};

const SAMPLE_QUERIES = [
  { label: "Hoodies", q: "hoodie" },
  { label: "Campus Tees", q: "tee" },
  { label: "PBT Keycaps", q: "keycap" },
  { label: "Water Bottles", q: "bottle" },
  { label: "Stickers", q: "sticker" },
];

/**
 * Channel3 Market Intelligence Radar:
 * Benchmarks campus society merchandise against external collegiate retail pricing.
 * Auto-scans on initial mount and displays real-time price comparisons.
 */
export function MarketDiscovery() {
  const [query, setQuery] = useState("hoodie");
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(searchQ?: string) {
    const q = (searchQ ?? query).trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/channel3/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Search unavailable");
      setResults(json.results as Result[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search unavailable");
    } finally {
      setBusy(false);
    }
  }

  // Auto-scan initial benchmarks on mount
  useEffect(() => {
    void search("hoodie");
  }, []);

  return (
    <div className="rounded-3xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
      <div className="space-y-5">
        {/* Radar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">
                travel_explore
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-headline-sm font-bold text-on-surface leading-tight">
                  Channel3 Market Price Radar
                </h3>
                <Badge tone="teal">Active Radar</Badge>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Benchmark student society merch against off-campus commercial bookstore rates
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Queries */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
            Select Benchmark Category:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {SAMPLE_QUERIES.map((s) => {
              const isSelected = query.toLowerCase() === s.q.toLowerCase();
              return (
                <button
                  key={s.q}
                  type="button"
                  onClick={() => {
                    setQuery(s.q);
                    void search(s.q);
                  }}
                  className={`px-3 py-1.5 rounded-full text-label-sm font-semibold transition-all cursor-pointer outline-none focus:outline-none ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-low border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search competitor merch or retail product benchmark..."
              aria-label="Search commercial merchandise"
              className="h-11 w-full rounded-2xl border border-outline-variant/70 bg-surface-low pl-10 pr-4 text-body-sm text-on-surface outline-none focus:outline-none focus:border-primary focus:bg-surface-lowest transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-label-md font-bold text-on-primary hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">
              {busy ? "hourglass_top" : "radar"}
            </span>
            <span>{busy ? "Scanning…" : "Scan Radar"}</span>
          </button>
        </form>

        {error ? (
          <p className="text-body-sm text-warning pt-1">{error}</p>
        ) : null}

        {/* Results Stream */}
        {results ? (
          results.length === 0 ? (
            <div className="py-8 rounded-2xl bg-surface-low text-center text-body-sm text-on-surface-variant">
              No competitor benchmarks found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {results.map((r, i) => (
                <div
                  key={`${r.url}-${i}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-outline-variant/40 bg-surface-low/50 hover:bg-surface-low/90 transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-body-sm font-semibold text-on-surface truncate">
                      {r.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-secondary">
                        {r.source}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                        Collegiate Benchmark
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-headline-sm font-bold text-primary block">
                      {r.price_cents !== null ? (
                        <MoneyDisplay cents={r.price_cents} />
                      ) : (
                        "Market Quote"
                      )}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5">
                      Est. Retail Quote
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </div>

      <div className="pt-4 border-t border-outline-variant/35 flex items-center justify-between text-[11px] text-on-surface-variant">
        <span>Channel3 Commercial Product Index</span>
        <span className="font-semibold text-secondary">
          Live External Price Benchmarking
        </span>
      </div>
    </div>
  );
}
