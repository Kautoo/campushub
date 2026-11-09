"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-warning-container text-warning flex items-center justify-center">
        <span className="material-symbols-outlined text-[30px]">
          storefront
        </span>
      </div>
      <div className="space-y-1.5 max-w-md">
        <Badge tone="warning">Storefront Notice</Badge>
        <h1 className="text-headline-md font-bold text-on-surface">
          Temporarily Unable to Load Store
        </h1>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          The campus catalog is briefly connecting to the database. Try
          refreshing or return to the main storefront.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-label-lg font-semibold text-on-primary hover:opacity-90 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[17px]">refresh</span>
          <span>Refresh Page</span>
        </button>
        <Link
          href="/demo"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-lowest px-6 text-label-lg font-semibold text-on-surface hover:bg-surface-low transition-all"
        >
          <span>Storefront Overview</span>
        </Link>
      </div>
    </div>
  );
}
