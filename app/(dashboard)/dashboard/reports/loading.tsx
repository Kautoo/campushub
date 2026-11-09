import {
  SectionHeaderSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton />
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
        <Skeleton className="h-6 w-44 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}
