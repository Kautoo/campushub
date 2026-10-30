"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CampusEvent } from "@/data/mockEvents";

export interface CampusCalendarWrapperProps {
  events: CampusEvent[];
  onEventClick?: (event: CampusEvent) => void;
  onEventReschedule?: (
    eventId: string,
    newDate: string,
    newTime: string
  ) => Promise<{ success: boolean; error?: string }>;
  onEventEdit?: (event: CampusEvent) => void;
  onCreateSlotClick?: (date: string, time: string) => void;
  readOnly?: boolean;
  className?: string;
}

function CalendarLoadingSkeleton() {
  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-24 h-9 bg-surface-container-low rounded-xl" />
          <div className="w-40 h-7 bg-surface-container-low rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-9 bg-surface-container-low rounded-xl" />
          <div className="w-48 h-9 bg-surface-container-low rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-6 bg-surface-container-low rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface-container-low/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const DynamicBryntumCalendar = dynamic(
  () => import("./BryntumCalendarView"),
  {
    ssr: false,
    loading: () => <CalendarLoadingSkeleton />,
  }
);

export function CampusCalendarWrapper(props: CampusCalendarWrapperProps) {
  return <DynamicBryntumCalendar {...props} />;
}

export default CampusCalendarWrapper;
