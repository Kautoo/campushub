import {
  SectionHeaderSkeleton,
  StatStripSkeleton,
  DataTableSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton />
      <StatStripSkeleton />
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/50 bg-surface-lowest p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <DataTableSkeleton rows={7} />
    </div>
  );
}
