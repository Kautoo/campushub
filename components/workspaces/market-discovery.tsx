"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
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
];

/**
 * Channel3 Market Intelligence Radar:
 * Benchmarks campus society merchandise against external collegiate retail pricing.
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

  return (
    <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                travel_explore
              </span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface leading-tight">
                Channel3 Market Intelligence Radar
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Benchmark club merchandise against collegiate retail pricing
              </p>
            </div>
          </div>
          <Badge tone="teal">Active</Badge>
        </div>

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Quick benchmarks:
          </span>
          {SAMPLE_QUERIES.map((s) => (
            <button
              key={s.q}
              type="button"
              onClick={() => {
                setQuery(s.q);
                void search(s.q);
              }}
              className="px-2.5 py-1 rounded-full bg-surface-low border border-outline-variant/50 text-[11px] font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="flex gap-2 pt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void search();
              }
            }}
            placeholder="Search competitor merch or product..."
            aria-label="Search commercial merchandise"
            className="focus-aura h-10 flex-1 rounded-xl border border-outline-variant/70 bg-surface-low px-3.5 text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
          />
          <button
            type="button"
            disabled={busy || !query.trim()}
            onClick={() => void search()}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-label-md font-semibold text-on-primary hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              search
            </span>
            <span>{busy ? "Scanning…" : "Scan"}</span>
          </button>
        </div>

        {error ? (
          <p className="text-body-sm text-warning pt-2">{error}</p>
        ) : null}

        {/* Results Stream */}
        {results ? (
          results.length === 0 ? (
            <div className="mt-4 p-4 rounded-xl bg-surface-low text-center text-body-sm text-on-surface-variant">
              No competitor benchmarks found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={`${r.url}-${i}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/40 bg-surface-low/60 hover:bg-surface-low transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-on-surface truncate">
                      {r.title}
                    </p>
                    <span className="text-[10.5px] font-mono text-secondary">
                      {r.source}
                    </span>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-headline-sm font-bold text-primary block">
                      {r.price_cents !== null ? (
                        <MoneyDisplay cents={r.price_cents} />
                      ) : (
                        "Market Quote"
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </div>

      <div className="pt-3 border-t border-outline-variant/35 flex items-center justify-between text-[11px] text-on-surface-variant">
        <span>Channel3 Commercial Product Index</span>
        <span className="font-semibold text-secondary">
          Collegiate Benchmarking
        </span>
      </div>
    </div>
  );
}
