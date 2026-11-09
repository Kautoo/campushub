"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { useStoreCurrency } from "@/components/store/currency-provider";

type Channel3Item = {
  title: string;
  price_cents: number | null;
  url: string;
  source: string;
};

const SEARCH_SUGGESTIONS = [
  { label: "Hoodies", query: "hoodie" },
  { label: "Campus Tees", query: "tee" },
  { label: "PBT Keycaps", query: "keycap" },
  { label: "Water Bottles", query: "bottle" },
];

/**
 * Channel3-Connected Market Intelligence Search for Storefront:
 * Connects student queries to Channel3's product index to benchmark society pricing
 * against commercial retail standards.
 */
export function Channel3StoreSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Channel3Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { format } = useStoreCurrency();

  async function handleSearch(term?: string) {
    const q = (term ?? query).trim();
    if (!q || loading) return;
    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch("/api/channel3/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary/40 bg-gradient-to-br from-surface-lowest via-secondary-container/10 to-surface-low p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[19px]">
              travel_explore
            </span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              Channel3 Market Discovery &amp; Price Radar
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Search collegiate merchandise and benchmark student society pricing against retail standards
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="teal" icon="verified">
            Channel3 Commerce Engine
          </Badge>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Search merchandise and scan market benchmarks (e.g. hoodie, tee, keycaps)..."
            aria-label="Search merchandise with Channel3"
            className="focus-aura h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-lowest pl-10 pr-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:border-secondary"
          />
        </div>
        <button
          type="button"
          disabled={loading || !query.trim()}
          onClick={() => void handleSearch()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-label-md font-semibold text-on-primary hover:opacity-90 disabled:opacity-50 transition-all shrink-0 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[17px]">
            radar
          </span>
          <span>{loading ? "Scanning Channel3…" : "Scan Market Radar"}</span>
        </button>
      </div>

      {/* Quick Discovery Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          Popular comparisons:
        </span>
        {SEARCH_SUGGESTIONS.map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => {
              setQuery(item.query);
              void handleSearch(item.query);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-outline-variant/60 bg-surface-lowest px-3 py-1 text-label-sm font-semibold text-on-surface hover:border-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[13px] text-secondary">
              search
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Results Dropdown Container */}
      {expanded && results ? (
        <div className="pt-2 space-y-3 border-t border-outline-variant/40">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
              Channel3 Market Benchmark Matches ({results.length})
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-label-sm text-on-surface-variant hover:text-on-surface"
            >
              Close Radar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((r, i) => (
              <div
                key={`${r.url}-${i}`}
                className="rounded-xl border border-outline-variant/50 bg-surface-lowest p-3.5 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-secondary">
                      {r.source}
                    </span>
                    <Badge tone="teal">Verified Benchmark</Badge>
                  </div>
                  <p className="text-body-sm font-semibold text-on-surface line-clamp-2">
                    {r.title}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/35 text-body-sm">
                  <span className="text-xs text-on-surface-variant">
                    Market Quote:
                  </span>
                  <span className="font-bold text-primary tabular-nums">
                    {r.price_cents !== null
                      ? format(r.price_cents)
                      : "Market Estimate"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-surface-low border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-sm">
            <span className="text-on-surface-variant">
              Looking for verified campus society merchandise at subsidized student member prices?
            </span>
            <Link
              href="/demo/shop"
              className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline shrink-0"
            >
              <span>Explore Official Merch Shop</span>
              <span className="material-symbols-outlined text-[14px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
