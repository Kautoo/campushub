"use client";

import { useState } from "react";

type Result = { title: string; price_cents: number | null; url: string; source: string };

/** Channel3 market-discovery widget: search listings, links out. */
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
    <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg">
      <p className="text-label-md text-on-surface-variant">Market discovery — Channel3</p>
      <div className="mt-2 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void search();
          }}
          placeholder="e.g. campus hoodie MYR"
          className="focus-aura h-10 w-full rounded-full border border-outline-variant bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={busy}
          className="focus-aura h-10 rounded-full bg-primary px-4 text-label-md font-semibold text-white dark:text-[#00201c] disabled:opacity-50"
        >
          {busy ? "…" : "Search"}
        </button>
      </div>
      {error ? <p className="text-body-sm text-error mt-2">{error}</p> : null}
      {results ? (
        results.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant mt-3">No market results.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {results.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between rounded-lg border border-outline-variant px-3 py-2 text-body-sm text-on-surface hover:bg-surface-low"
                >
                  <span className="line-clamp-1">{r.title}</span>
                  <span className="text-label-md text-on-surface-variant shrink-0 ml-2">
                    {r.price_cents !== null ? `RM ${(r.price_cents / 100).toFixed(2)}` : r.source}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )
      ) : null}
      <p className="text-body-sm text-on-surface-variant mt-3">
        Links to external marketplaces — CampusHub never invents listings.
      </p>
    </div>
  );
}
