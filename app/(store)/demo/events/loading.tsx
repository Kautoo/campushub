import { Skeleton, EventCardSkeleton } from "@/components/ui/skeleton";

export default function DemoEventsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-4">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72 sm:w-96 rounded-xl" />
            <Skeleton className="h-4 w-80 sm:w-[500px] rounded" />
          </div>
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    </main>
  );
}
