import { cn } from "@/lib/utils";

export type ChipTone =
  | "primary"
  | "teal"
  | "neutral"
  | "success"
  | "warning"
  | "error";

const tones: Record<ChipTone, string> = {
  primary: "bg-primary-container text-white dark:bg-primary/15 dark:text-primary",
  teal: "bg-secondary-container text-primary-container dark:bg-secondary/15 dark:text-secondary",
  neutral: "bg-surface-container text-ink-variant dark:bg-surface-high dark:text-muted",
  success: "bg-success-container text-success",
  warning: "bg-warning-container text-warning",
  error: "bg-error-container text-error",
};

/** Stitch pill badge. */
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[12px]">{icon}</span>
      ) : null}
      {children}
    </span>
  );
}

/** Delta badge: positive teal / negative red with arrow. */
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
    <Badge tone={up ? "success" : "error"} className={className}>
      <span className="material-symbols-outlined text-[12px]">
        {up ? "arrow_upward" : "arrow_downward"}
      </span>
      {Math.abs(value).toFixed(1)}
      {suffix}
    </Badge>
  );
}

export { tones as chipTones };
