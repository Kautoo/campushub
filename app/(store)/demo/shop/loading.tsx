import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

export default function DemoShopLoading() {
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

      {/* Filter toolbar skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 p-3.5 rounded-2xl border border-outline-variant/50 bg-surface-lowest">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <Skeleton className="h-9 w-60 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </main>
  );
}
