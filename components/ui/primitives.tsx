import { cn } from "@/lib/utils";

/** Icon tile + eyebrow + heading + subtitle used atop dashboard workspaces. */
export function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  icon: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1",
        className,
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs ring-1 ring-outline-variant/20">
          <span className="material-symbols-outlined text-[21px] text-secondary-fixed">
            {icon}
          </span>
        </div>
        <div className="space-y-0.5">
          {eyebrow ? (
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      ) : null}
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
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-low/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[26px]">{icon}</span>
      </div>
      <p className="text-headline-sm font-bold text-on-surface">{title}</p>
      {body ? (
        <p className="max-w-md text-body-md text-on-surface-variant leading-relaxed">
          {body}
        </p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

/** Price display in CampusHub commerce style with tabular numerals. */
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
    <span className={cn("inline-flex items-baseline gap-1.5 tabular-nums", className)}>
      <span className="text-headline-sm font-bold text-on-surface">
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
