import { Skeleton } from "@/components/ui/skeleton";

export default function DemoCheckoutLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row justify-between gap-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs space-y-4">
            <Skeleton className="h-6 w-52 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs space-y-4">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-5 rounded-2xl border border-outline-variant/60 bg-surface-lowest p-6 shadow-md space-y-5">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-7 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </main>
  );
}
