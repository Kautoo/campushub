import {
  Skeleton,
  EventCardSkeleton,
  ProductCardSkeleton,
} from "@/components/ui/skeleton";

export default function DemoStorefrontLoading() {
  return (
    <main className="w-full bg-surface min-h-screen space-y-10">
      {/* Hero Banner Skeleton */}
      <div className="relative w-full overflow-hidden border-b border-outline-variant/50 bg-surface-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <Skeleton className="h-7 w-48 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-4/5 rounded-2xl" />
                <Skeleton className="h-12 w-3/5 rounded-2xl" />
              </div>
              <Skeleton className="h-16 w-full max-w-xl rounded-xl" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-12 w-48 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest overflow-hidden shadow-xl space-y-4">
                <Skeleton className="h-64 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-8 w-28 rounded-lg" />
                    <Skeleton className="h-10 w-36 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Col Directory Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>

      {/* 2-Col Event Cards Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-8 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>

      {/* 4-Col Product Cards Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-16">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-8 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    </main>
  );
}
