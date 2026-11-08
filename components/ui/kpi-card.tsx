import { cn } from "@/lib/utils";
import { DeltaBadge } from "./badge";
import { formatMoneyCompact } from "@/lib/money";
import { NumberTicker } from "@/components/magicui";

/**
 * Stitch KPI Card — 1:1 copy of Stitch "Cards, Surfaces & Data Displays" board:
 * - Card: group hover with lift, shadow-sm -> shadow-md, flex flex-col justify-between
 * - Top: font-label-md text-on-surface-variant + w-8 h-8 rounded-lg icon tile
 * - Middle: font-headline-lg text-headline-lg text-primary tracking-tight + NumberTicker
 * - Delta: trending_up badge + meta line
 * - Bottom: Stitch mini SVG sparkline
 */
export function KpiCard({
  label,
  value,
  delta,
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

  // Pre-baked sparkline paths from Stitch reference board (varied by tone)
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
        "group relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </span>
        <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
      </div>

      <div className="mt-space-md flex flex-col gap-space-xs">
        <div className="flex items-baseline justify-between">
          <span className="font-headline-lg text-headline-lg text-primary tracking-tight">
            {format === "money" ? "RM " : ""}
            <NumberTicker
              value={format === "money" ? value / 100 : value}
              decimalPlaces={format === "money" ? 2 : 0}
            />
          </span>
        </div>

        <div className="flex items-center justify-between">
          {delta !== undefined ? (
            <DeltaBadge value={delta} />
          ) : (
            <div className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
              <span>+18.4%</span>
            </div>
          )}
          <span className="font-label-sm text-label-sm text-outline">
            vs last 30d
          </span>
        </div>
      </div>

      {/* Stitch Sparkline Mini SVG */}
      <div className="mt-space-md pt-space-xs" aria-hidden>
        <svg
          className={cn("w-full h-8", sparkColor)}
          fill="none"
          viewBox="0 0 100 24"
        >
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
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

/** Horizontal row of KPI cards (Stitch: 4-col grid, gap-space-md). */
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
        "grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
