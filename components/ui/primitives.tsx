import { cn } from "@/lib/utils";
import { IconTile } from "./icon";

/** Icon tile + heading + subtitle used atop dashboard sections. */
export function SectionHeader({
  icon,
  title,
  subtitle,
  actions,
  className,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <IconTile icon={icon} tone="teal" size={40} />
        <div>
          <h2 className="text-headline-md text-ink">{title}</h2>
          {subtitle ? (
            <p className="text-body-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Empty/placeholder state with icon and optional CTA. */
export function EmptyState({
  icon = "inbox",
  title,
  body,
  action,
  className,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-lowest px-6 py-12 text-center",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[32px] text-muted">
        {icon}
      </span>
      <p className="text-headline-sm text-ink">{title}</p>
      {body ? <p className="max-w-sm text-body-sm text-muted">{body}</p> : null}
      {action}
    </div>
  );
}

/** Price display in Stitch commerce style. */
export function PriceTag({
  formatted,
  originalFormatted,
  className,
}: {
  formatted: string;
  originalFormatted?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="text-headline-sm font-semibold text-ink">
        {formatted}
      </span>
      {originalFormatted ? (
        <span className="text-body-sm text-muted line-through">
          {originalFormatted}
        </span>
      ) : null}
    </span>
  );
}
