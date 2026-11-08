import { cn } from "@/lib/utils";

export type ChipTone =
  | "primary"
  | "teal"
  | "neutral"
  | "success"
  | "warning"
  | "error";

/**
 * Stitch badge / chip tokens (from Cards board `a085039c` & `7b64c5f2`):
 * - success: bg-tertiary-fixed/30 text-on-tertiary-container
 * - primary: bg-primary-fixed text-primary
 * - teal: bg-secondary-container text-on-secondary-container
 * - error: bg-error-container text-on-error-container
 * - warning: bg-warning-container text-warning
 * - neutral: bg-surface-container text-on-surface-variant
 */
const tones: Record<ChipTone, string> = {
  primary: "bg-primary-fixed text-primary",
  teal: "bg-secondary-container text-on-secondary-container",
  neutral: "bg-surface-container text-on-surface-variant",
  success: "bg-tertiary-fixed/30 text-on-tertiary-container",
  warning: "bg-warning-container text-warning",
  error: "bg-error-container text-on-error-container",
};

/** Stitch pill badge: 1:1 with Stitch chips showcase. */
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
        "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap",
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

/**
 * Stitch DeltaBadge: 1:1 with Stitch KPI cards.
 * Uses `trending_up` / `trending_down` icons (14px) and Stitch tertiary-fixed chip.
 */
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
        "inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full font-label-sm text-label-sm",
        up
          ? "bg-tertiary-fixed/30 text-on-tertiary-container"
          : "bg-error-container text-on-error-container",
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
