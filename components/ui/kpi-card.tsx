import { cn } from "@/lib/utils";
import { DeltaBadge } from "./badge";
import { NumberTicker } from "@/components/magicui";

/**
 * CampusHub 2.0 Executive KPI Card (aligned with DESIGN.md):
 * - Crisp 1px border, subtle hover lift, Geist tabular numerals
 * - Top: label-md + semantic icon tile
 * - Middle: 28px bold KPI figure with NumberTicker
 * - Footer: DeltaBadge or contextual sublabel + mini sparkline
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
  /** "money" renders cents as RM; "number" renders with thousands separators. */
  format?: "money" | "number";
  className?: string;
}) {
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
    teal: "M0,20 Q15,18 28,14 T52,15 T74,8 T100,3",
    primary: "M0,19 Q20,22 40,12 T70,16 T100,6",
    success: "M0,22 Q25,18 45,10 T75,12 T100,4",
    neutral: "M0,16 Q20,18 45,14 T70,15 T100,10",
  };
  const path = sparkPaths[tone] ?? sparkPaths.teal;

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
            {format === "money" ? "RM " : ""}
            <NumberTicker
              value={format === "money" ? value / 100 : value}
              decimalPlaces={format === "money" ? 2 : 0}
            />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 min-h-[22px]">
          {delta !== undefined ? (
            <>
              <DeltaBadge value={delta} />
              <span className="text-label-sm text-on-surface-variant">
                {sublabel ?? "vs prior period"}
              </span>
            </>
          ) : sublabel ? (
            <span className="text-body-sm text-on-surface-variant truncate">
              {sublabel}
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
          viewBox="0 0 100 24"
        >
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
          <path
            d={`${path} L100,24 L0,24 Z`}
            fill="currentColor"
            fillOpacity="0.08"
          />
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
  items: React.ComponentProps<typeof KpiCard>[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
