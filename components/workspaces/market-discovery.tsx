"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";

type Result = {
  title: string;
  price_cents: number | null;
  url: string;
  source: string;
};

/**
 * Channel3 Market Intelligence Radar — Styled 1:1 with Stitch MagicUI & AI Widget System.
 */
export function MarketDiscovery() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    const q = query.trim();
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
      if (!res.ok) throw new Error(json.error ?? "channel3_error");
      setResults(json.results as Result[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "search_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg ring-1 ring-outline-variant/30 flex flex-col justify-between">
      <div>
        {/* Header matching Stitch AI Widget Card */}
        <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-on-secondary-container flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                radar
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  Channel3 Market Radar
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-[10px] font-semibold">
                  Live Engine
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Live collegiate merchant sourcing &amp; price benchmarking
              </span>
            </div>
          </div>
        </div>

        {/* Search Input Bar with Stitch styling */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void search();
              }}
              placeholder="Benchmark item (e.g. collegiate hoodie MYR, sticker pack)"
              className="focus-aura h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => void search()}
            disabled={busy}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-xs hover:shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {busy ? "progress_activity" : "travel_explore"}
            </span>
            <span>{busy ? "Scanning…" : "Scan Market"}</span>
          </button>
        </div>

        {error ? (
          <div className="mt-3 flex items-center gap-2 p-space-sm rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        ) : null}

        {/* Results Stream matching Stitch Data Displays */}
        {results ? (
          results.length === 0 ? (
            <div className="mt-4 p-space-lg rounded-xl bg-surface-container-low text-center">
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant">
                search_off
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                No external campus listings found for this benchmark query.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {results.map((r, i) => (
                <div
                  key={`${r.url}-${i}`}
                  className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/80 hover:bg-surface-container-high/70 transition-all ring-1 ring-outline-variant/20"
                >
                  <div className="flex items-center gap-space-sm min-w-0 pr-2">
                    <span className="w-8 h-8 rounded-lg bg-surface-container-lowest text-secondary flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">
                        shopping_bag
                      </span>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                        {r.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.2 rounded-full bg-surface-container font-label-sm text-[10px] text-on-surface-variant font-medium">
                          {r.source}
                        </span>
                        <span className="font-body-sm text-[11px] text-secondary font-semibold">
                          Verified Listing
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {r.price_cents !== null ? (
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">
                        {formatMoney(r.price_cents)}
                      </span>
                    ) : (
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Quote on Request
                      </span>
                    )}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors shadow-xs"
                      title="Open Merchant Link"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        open_in_new
                      </span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </div>

      <div className="mt-space-md pt-space-xs border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-[11px]">
        <span>Powered by Channel3 Commerce Mesh</span>
        <span>Real-time Scrapes</span>
      </div>
    </div>
  );
}
