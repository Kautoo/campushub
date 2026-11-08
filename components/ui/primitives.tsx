import { cn } from "@/lib/utils";

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
    <div className={cn("flex items-start justify-between gap-space-md", className)}>
      <div className="flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-on-secondary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {title}
          </h2>
          {subtitle ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {subtitle}
            </p>
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
        "flex flex-col items-center justify-center gap-3 rounded-xl bg-surface-container-low px-6 py-12 text-center",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
        {icon}
      </span>
      <p className="font-headline-sm text-headline-sm text-on-surface">{title}</p>
      {body ? (
        <p className="max-w-sm font-body-sm text-body-sm text-on-surface-variant">
          {body}
        </p>
      ) : null}
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
      <span className="text-headline-sm font-semibold text-on-surface">
        {formatted}
      </span>
      {originalFormatted ? (
        <span className="text-body-sm text-on-surface-variant line-through">
          {originalFormatted}
        </span>
      ) : null}
    </span>
  );
}
