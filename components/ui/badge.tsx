import { cn } from "@/lib/utils";

export type ChipTone =
  | "primary"
  | "teal"
  | "neutral"
  | "success"
  | "warning"
  | "error";

/**
 * Semantic status & category badges with guaranteed WCAG AA contrast in both Light and Dark themes.
 */
const tones: Record<ChipTone, string> = {
  primary:
    "bg-primary-fixed text-primary border border-primary/20 dark:border-primary/30",
  teal: "bg-secondary-container text-on-secondary-container border border-secondary/20",
  neutral:
    "bg-surface-container text-on-surface-variant border border-outline-variant/50",
  success:
    "bg-success-container text-success border border-success/25",
  warning:
    "bg-warning-container text-warning border border-warning/25",
  error:
    "bg-error-container text-on-error-container border border-error/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
  icon?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
      ) : null}
      {children}
    </span>
  );
}

export function DeltaBadge({
  value,
  suffix = "%",
  className,
}: {
  /** Percentage delta; positive = up. */
  value: number;
  suffix?: string;
  className?: string;
}) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-semibold tabular-nums",
        up
          ? "bg-success-container text-success border border-success/25"
          : "bg-error-container text-on-error-container border border-error/25",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[14px]">
        {up ? "trending_up" : "trending_down"}
      </span>
      <span>
        {up ? "+" : "-"}
        {Math.abs(value).toFixed(1)}
        {suffix}
      </span>
    </span>
  );
}

export { tones as chipTones };
