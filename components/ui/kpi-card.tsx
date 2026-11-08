import { cn } from "@/lib/utils";
import { DeltaBadge } from "./badge";
import { formatMoneyCompact } from "@/lib/money";
import { NumberTicker } from "@/components/magicui";

/**
 * Stitch KPI card: borderless `shadow-sm` card with an uppercase label,
 * animated headline value and an icon chip. Prop contract frozen —
 * callers pass {label, value, icon, format?, tone?}.
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
  const chipTones: Record<string, string> = {
    primary: "bg-primary-fixed/40 text-primary",
    teal: "bg-secondary-container/40 text-on-secondary-container",
    neutral: "bg-surface-container text-on-surface-variant",
    success: "bg-tertiary-fixed/30 text-on-tertiary-container",
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm",
        "transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
          <span className="font-headline-lg text-headline-lg text-primary mt-1 tabular-nums">
            <NumberTicker
              value={format === "money" ? value / 100 : value}
              decimalPlaces={format === "money" ? 2 : 0}
            />
          </span>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            chipTones[tone],
          )}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      {delta !== undefined ? (
        <div className="mt-4 flex items-center justify-between pt-2">
          <DeltaBadge value={delta} />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            vs previous period
          </span>
        </div>
      ) : null}
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
        "grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
