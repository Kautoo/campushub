import {
  SectionHeaderSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

export default function AiInsightsLoading() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton />
      {/* Insight generator buttons skeleton */}
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      {/* 2-col chat / diagram */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/40">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-6 w-48 rounded-lg" />
          </div>
          <div className="h-64 w-full rounded-xl bg-surface-low" />
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-full" />
          </div>
        </div>
        <div className="lg:col-span-5 rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
