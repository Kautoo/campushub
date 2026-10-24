import React from "react";
import { OrganizerOverviewSkeleton } from "@/components/ui/skeleton";

export default function OrganizerLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 bg-surface-container-high/60 rounded-xl animate-pulse" />
        <div className="h-4 w-96 bg-surface-container-high/40 rounded-lg animate-pulse" />
      </div>
      <OrganizerOverviewSkeleton />
    </div>
  );
}

