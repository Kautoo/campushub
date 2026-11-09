"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center">
        <span className="material-symbols-outlined text-[30px]">error</span>
      </div>
      <div className="space-y-1.5 max-w-md">
        <Badge tone="error">Workspace Interruption</Badge>
        <h2 className="text-headline-md font-bold text-on-surface">
          Unable to Load Workspace Data
        </h2>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          A temporary network or database connection error occurred. Your
          organization data remains safe in Postgres.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-label-lg font-semibold text-on-primary hover:opacity-90 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[17px]">refresh</span>
          <span>Retry Workspace</span>
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-lowest px-6 text-label-lg font-semibold text-on-surface hover:bg-surface-low transition-all"
        >
          <span>Return to Overview</span>
        </Link>
      </div>
    </div>
  );
}
