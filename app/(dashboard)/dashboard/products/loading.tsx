import {
  SectionHeaderSkeleton,
  StatStripSkeleton,
  DataTableSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton />
      <StatStripSkeleton />
      <DataTableSkeleton rows={8} />
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
          <Skeleton className="h-6 w-52 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
