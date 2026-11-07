import { cn } from "@/lib/utils";
import { IconTile } from "./icon";
import { DeltaBadge } from "./badge";
import { formatMoneyCompact } from "@/lib/money";

/** KPI tile: icon tile + label + big number + delta badge. */
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
  const display =
    format === "money"
      ? formatMoneyCompact(value)
      : value.toLocaleString("en-MY");
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-lowest p-4 shadow-card",
        "transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <IconTile icon={icon} tone={tone} size={36} />
          <span className="text-label-md text-muted">{label}</span>
        </div>
        {delta !== undefined ? <DeltaBadge value={delta} /> : null}
      </div>
      <p className="mt-3 text-headline-lg tracking-tight text-ink">{display}</p>
    </div>
  );
}

/** Horizontal row of KPI cards. */
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
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
