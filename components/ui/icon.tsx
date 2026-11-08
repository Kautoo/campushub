import { cn } from "@/lib/utils";

/** Material Symbols Outlined icon. */
export function Icon({
  name,
  className,
  filled,
  size = 20,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("material-symbols-outlined select-none", filled && "filled", className)}
      style={{ fontSize: size, width: size }}
    >
      {name}
    </span>
  );
}

/** Rounded icon tile used across headers/sections/KPIs. */
export function IconTile({
  icon,
  tone = "primary",
  size = 40,
  className,
}: {
  icon: string;
  tone?: "primary" | "teal" | "neutral" | "error" | "success" | "warning";
  size?: number;
  className?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-container text-white dark:bg-primary/15 dark:text-primary",
    teal: "bg-secondary-container text-primary-container dark:bg-secondary/15 dark:text-secondary",
    neutral: "bg-surface-container text-on-surface-variant dark:bg-surface-high",
    error: "bg-error-container text-error",
    success: "bg-success-container text-success",
    warning: "bg-warning-container text-warning",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg",
        tones[tone],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} />
    </span>
  );
}
