"use client";

import { cn } from "@/lib/utils";
import { DeltaBadge } from "./badge";
import { NumberTicker } from "@/components/magicui";
import { useCurrency, CURRENCY_CONFIG } from "@/components/ui/currency-context";

/**
 * CampusHub 2.0 Executive KPI Card (aligned with DESIGN.md):
 * - Crisp 1px border, subtle hover lift, Geist tabular numerals
 * - Top: label-md + semantic icon tile
 * - Middle: 28px bold KPI figure with NumberTicker
 * - Footer: DeltaBadge or contextual sublabel + mini sparkline
 * - Reactively connects to useCurrency() for instantaneous live conversion
 */
export function KpiCard({
  label,
  value,
  delta,
  sublabel,
  icon,
  tone = "teal",
  format,
  className,
}: {
  label: string;
  /** Numeric value (count or cents depending on format). */
  value: number;
  /** Percentage delta vs previous period. */
  delta?: number;
  /** Optional contextual detail shown below the primary metric. */
  sublabel?: string;
  icon: string;
  tone?: "primary" | "teal" | "neutral" | "success";
  /** "money" renders cents in the active currency; "number" renders with thousands separators. */
  format?: "money" | "number";
  className?: string;
}) {
  const { currency } = useCurrency();
  const meta = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.MYR;
  const symbol = meta.symbol;
  const rate = meta.rateFromMyr;

  const sparkColor =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-on-tertiary-container"
        : "text-secondary";

  const iconTileTone =
    tone === "primary"
      ? "bg-primary-fixed/60 text-primary"
      : tone === "success"
        ? "bg-tertiary-fixed/35 text-on-tertiary-container"
        : tone === "neutral"
          ? "bg-surface-container text-on-surface-variant"
          : "bg-secondary-container/50 text-on-secondary-container";

  const sparkPaths: Record<string, string> = {
    teal: "M0 18 Q 20 12, 40 15 T 80 8 T 120 13 T 160 5 T 200 2",
    primary: "M0 20 Q 25 16, 50 14 T 100 11 T 150 7 T 200 3",
    success: "M0 19 Q 20 14, 50 15 T 90 9 T 140 6 T 200 2",
    neutral: "M0 16 Q 30 15, 60 17 T 120 14 T 170 12 T 200 11",
  };
  const path = sparkPaths[tone] ?? sparkPaths.teal;

  const numericValue =
    format === "money" ? (value * rate) / 100 : value;

  // Reactively replace any static currency prefixes in sublabel
  const renderedSublabel = sublabel
    ? sublabel.replace(/RM\s*([\d,]+(?:\.\d+)?)/g, (_, amt) => {
        const raw = parseFloat(amt.replace(/,/g, ""));
        const conv = raw * rate;
        return `${symbol} ${conv.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      })
    : sublabel;

  return (
    <div
      className={cn(
        "group relative bg-surface-lowest rounded-2xl border border-outline-variant/45 p-5 shadow-xs hover:shadow-md hover:border-secondary/35 transition-all duration-200 flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-label-md font-semibold text-on-surface-variant">
          {label}
        </span>
        <span
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
            iconTileTone,
          )}
        >
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
      </div>

      <div className="mt-3.5 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between tabular-nums">
          <span className="data-kpi text-primary tracking-tight">
            {format === "money" ? `${symbol} ` : ""}
            <NumberTicker
              value={numericValue}
              decimalPlaces={format === "money" ? 2 : 0}
            />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 min-h-[22px]">
          {delta !== undefined ? (
            <>
              <DeltaBadge value={delta} />
              <span className="text-label-sm text-on-surface-variant">
                {renderedSublabel ?? "vs prior period"}
              </span>
            </>
          ) : renderedSublabel ? (
            <span className="text-body-sm text-on-surface-variant truncate">
              {renderedSublabel}
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">
                  verified
                </span>
                <span>Live ledger</span>
              </span>
              <span className="text-label-sm text-on-surface-variant">
                Synced
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sparkline Mini SVG */}
      <div className="mt-3 pt-1" aria-hidden>
        <svg
          className={cn("w-full h-7", sparkColor)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 200 24"
          preserveAspectRatio="none"
        >
          <path d={path} />
        </svg>
      </div>
    </div>
  );
}

/** Horizontal row of KPI cards (4-col grid on desktop). */
export function StatStrip({
  items,
  className,
}: {
  items: Array<{
    label: string;
    value: number;
    delta?: number;
    sublabel?: string;
    icon: string;
    tone?: "primary" | "teal" | "neutral" | "success";
    format?: "money" | "number";
  }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      )}
    >
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
