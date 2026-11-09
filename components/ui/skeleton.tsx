import { cn } from "@/lib/utils";

/** Base shimmering skeleton pulse primitive */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-container/60 dark:bg-surface-container/40",
        className,
      )}
      {...props}
    />
  );
}

/** Shimmering Section Header skeleton matching SectionHeader primitive */
export function SectionHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div className="flex items-start sm:items-center gap-3.5">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28 rounded-md" />
          <Skeleton className="h-7 w-64 sm:w-80 rounded-lg" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

/** Single KPI card skeleton matching KpiCard */
export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-7 w-full rounded-md mt-1" />
    </div>
  );
}

/** 4-Column StatStrip skeleton matching StatStrip */
export function StatStripSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCardSkeleton />
      <KpiCardSkeleton />
      <KpiCardSkeleton />
      <KpiCardSkeleton />
    </div>
  );
}

/** AG Grid / Data Table skeleton with toolbar, header row, and striped rows */
export function DataTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-4">
      {/* Fake Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-60 rounded-lg" />
          <div className="hidden sm:flex items-center gap-1.5">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Grid Header & Rows */}
      <div className="rounded-xl border border-outline-variant/40 overflow-hidden">
        {/* Header row */}
        <div className="h-11 bg-surface-low/80 flex items-center px-4 gap-4 border-b border-outline-variant/40">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-3.5 w-24 rounded hidden sm:block" />
          <Skeleton className="h-3.5 w-28 rounded hidden md:block" />
          <Skeleton className="h-3.5 w-20 rounded ml-auto" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-outline-variant/30">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-14 flex items-center px-4 gap-4 bg-surface-lowest"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0 max-w-xs">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
              <Skeleton className="h-4 w-28 rounded hidden md:block" />
              <Skeleton className="h-4 w-16 rounded ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination footer */}
        <div className="h-12 bg-surface-lowest border-t border-outline-variant/40 flex items-center justify-between px-4">
          <Skeleton className="h-3.5 w-28 rounded" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Storefront Event Card skeleton */
export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest overflow-hidden shadow-xs flex flex-col">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-2 w-full rounded-full mt-2" />
        </div>
        <div className="space-y-2 pt-3 border-t border-outline-variant/40">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Storefront Product Card skeleton */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest overflow-hidden shadow-xs flex flex-col">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-5 w-4/5 rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/35">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
