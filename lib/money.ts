export const DEFAULT_CURRENCY = "MYR";

/**
 * Format integer cents as a localized currency string.
 * `RM 1,234.56` for MYR; falls back to `SYM 1,234.56` for other codes.
 */
export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const symbols: Record<string, string> = { MYR: "RM", USD: "$", SGD: "S$" };
  const symbol = symbols[currency] ?? currency;
  const amount = (cents / 100).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${amount}`;
}

/** Compact display for KPI tiles: RM 45.2k */
export function formatMoneyCompact(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const symbols: Record<string, string> = { MYR: "RM", USD: "$", SGD: "S$" };
  const symbol = symbols[currency] ?? currency;
  const v = cents / 100;
  if (Math.abs(v) >= 1_000_000)
    return `${symbol} ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${symbol} ${(v / 1_000).toFixed(1)}k`;
  return `${symbol} ${v.toFixed(2)}`;
}

/** Parse user-entered "RM 12.50" / "12.50" → integer cents. Returns null when unparseable. */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) return null;
  return Math.round(Number(cleaned) * 100);
}

/** Percent helper for deltas: 12.4 → "+12.4%" */
export function formatDelta(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}
