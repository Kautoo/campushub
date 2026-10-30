"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CampusEvent } from "@/data/mockEvents";
import {
  campusEventToBryntum,
  BryntumEventModel,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  MALAYSIA_TIMEZONE,
  parseEventDateTime,
} from "@/lib/calendar/event-adapter";
import { checkScheduleConflict } from "@/lib/calendar/conflict-detector";

export type CalendarViewMode = "month" | "week" | "day" | "agenda";

interface BryntumCalendarViewProps {
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

export default function BryntumCalendarView({
  events,
  onEventClick,
  onEventReschedule,
  onEventEdit,
  onCreateSlotClick,
  readOnly = false,
  className = "",
}: BryntumCalendarViewProps) {
  // Navigation & View State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date("2025-11-14T10:00:00+08:00"));
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Reschedule / Move Modal State
  const [reschedulingEvent, setReschedulingEvent] = useState<CampusEvent | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState<boolean>(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);

  // Transform events to Bryntum models
  const bryntumEvents = useMemo<BryntumEventModel[]>(() => {
    return events.map((ev) => campusEventToBryntum(ev));
  }, [events]);

  // Filtered Bryntum models
  const filteredEvents = useMemo(() => {
    return bryntumEvents.filter((ev) => {
      if (selectedCategory !== "All" && ev.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "ALL" && ev.status !== selectedStatus) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesName = ev.name.toLowerCase().includes(q);
        const matchesLocation = ev.location?.toLowerCase().includes(q);
        const matchesOrg = ev.organizer?.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation && !matchesOrg) return false;
      }
      return true;
    });
  }, [bryntumEvents, selectedCategory, selectedStatus, searchFilter]);

  // Date Navigation Handlers
  const handleToday = () => {
    setCurrentDate(new Date("2025-11-14T10:00:00+08:00"));
  };

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setUTCMonth(d.getUTCMonth() - 1);
    } else if (viewMode === "week") {
      d.setUTCDate(d.getUTCDate() - 7);
    } else {
      d.setUTCDate(d.getUTCDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setUTCMonth(d.getUTCMonth() + 1);
    } else if (viewMode === "week") {
      d.setUTCDate(d.getUTCDate() + 7);
    } else {
      d.setUTCDate(d.getUTCDate() + 1);
    }
    setCurrentDate(d);
  };

  // Current View Header Text
  const currentViewTitle = useMemo(() => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.toLocaleString("en-US", { month: "long", timeZone: MALAYSIA_TIMEZONE });
    if (viewMode === "month") {
      return `${month} ${year}`;
    }
    if (viewMode === "week") {
      // Find start and end of week (Sunday to Saturday)
      const start = new Date(currentDate);
      start.setUTCDate(start.getUTCDate() - start.getUTCDay());
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6);
      const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${startStr} – ${endStr}`;
    }
    return currentDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: MALAYSIA_TIMEZONE,
    });
  }, [currentDate, viewMode]);

  // Initiate Reschedule
  const openRescheduleModal = (event: CampusEvent) => {
    if (readOnly) return;
    setReschedulingEvent(event);
    setRescheduleDate(event.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? event.date : "2025-11-14");
    setRescheduleTime(event.time?.match(/^\d{2}:\d{2}$/) ? event.time : "17:00");
    setRescheduleError(null);
  };

  // Submit Reschedule with validation
  const handleConfirmReschedule = async () => {
    if (!reschedulingEvent || !onEventReschedule) return;
    setIsSubmittingReschedule(true);
    setRescheduleError(null);

    // Frontend pre-validation check
    const conflictCheck = checkScheduleConflict(
      events,
      {
        id: reschedulingEvent.id,
        title: reschedulingEvent.title,
        location: reschedulingEvent.location,
        date: rescheduleDate,
        time: rescheduleTime,
        organizationId: reschedulingEvent.organizationId,
      },
      reschedulingEvent.id
    );

    if (conflictCheck.hasConflict) {
      setRescheduleError(conflictCheck.reason || "Scheduling conflict detected.");
      setIsSubmittingReschedule(false);
      return;
    }

    try {
      const res = await onEventReschedule(reschedulingEvent.id, rescheduleDate, rescheduleTime);
      if (!res.success) {
        setRescheduleError(res.error || "Failed to update event schedule.");
      } else {
        setRescheduleSuccessMsg(`"${reschedulingEvent.title}" successfully rescheduled to ${rescheduleDate} at ${rescheduleTime}`);
        setReschedulingEvent(null);
        setTimeout(() => setRescheduleSuccessMsg(null), 4000);
      }
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : "Network error during rescheduling.");
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Find original CampusEvent from Bryntum model
  const resolveOriginalEvent = useCallback(
    (bryntumId: string): CampusEvent | undefined => {
      return events.find((e) => e.id === bryntumId);
    },
    [events]
  );

  // Month grid generation
  const monthGridDays = useMemo(() => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    
    // First day of current month
    const firstDay = new Date(Date.UTC(year, month, 1));
    const startingDayOfWeek = firstDay.getUTCDay(); // 0 is Sunday
    
    // Number of days in current month
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    // Days in previous month for leading padding
    const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const days = [];

    // Leading days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(Date.UTC(year, month - 1, dayNum));
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const dateString = `${prevDate.getUTCFullYear()}-${pad(prevDate.getUTCMonth() + 1)}-${pad(dayNum)}`;
      days.push({
        date: prevDate,
        dayNum,
        isCurrentMonth: false,
        dateString,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const dateString = `${year}-${pad(month + 1)}-${pad(d)}`;
      const currentD = new Date(Date.UTC(year, month, d));
      days.push({
        date: currentD,
        dayNum: d,
        isCurrentMonth: true,
        dateString,
      });
    }

    // Trailing days from next month to complete 5 or 6 weeks (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(Date.UTC(year, month + 1, d));
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const dateString = `${nextDate.getUTCFullYear()}-${pad(nextDate.getUTCMonth() + 1)}-${pad(d)}`;
      days.push({
        date: nextDate,
        dayNum: d,
        isCurrentMonth: false,
        dateString,
      });
    }

    return days;
  }, [currentDate]);

  // Map events to specific date strings
  const eventsByDate = useMemo(() => {
    const map = new Map<string, BryntumEventModel[]>();
    for (const ev of filteredEvents) {
      const match = ev.startDate.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        const key = match[1];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev);
      }
    }
    return map;
  }, [filteredEvents]);

  // Week View Days
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getUTCDay();
    const sunday = new Date(d);
    sunday.setUTCDate(d.getUTCDate() - dayOfWeek);

    const days = [];
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    for (let i = 0; i < 7; i++) {
      const curr = new Date(sunday);
      curr.setUTCDate(sunday.getUTCDate() + i);
      const dateString = `${curr.getUTCFullYear()}-${pad(curr.getUTCMonth() + 1)}-${pad(curr.getUTCDate())}`;
      days.push({
        date: curr,
        dayNum: curr.getUTCDate(),
        dayName: curr.toLocaleDateString("en-US", { weekday: "short", timeZone: MALAYSIA_TIMEZONE }),
        dateString,
      });
    }
    return days;
  }, [currentDate]);

  return (
    <div className={`bryntum-calendar-container bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Bryntum Stockholm Header & Controls Toolbar */}
      <div className="bryntum-calendar-header px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-surface-container-lowest border border-outline-variant/40 p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title="Previous period"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-headline font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title="Next period"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl font-headline font-extrabold text-on-surface flex items-center gap-2">
              <span>{currentViewTitle}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                MYT (UTC+8)
              </span>
            </h2>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-outline pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-outline focus:outline-hidden focus:ring-1 focus:ring-primary w-40 sm:w-48 font-headline"
            />
          </div>

          {/* View mode toggle: Month / Week / Day / Agenda */}
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-1 shadow-2xs">
            {(["month", "week", "day", "agenda"] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold capitalize transition-all cursor-pointer ${
                  viewMode === mode
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {!readOnly && onCreateSlotClick && (
            <button
              type="button"
              onClick={() => onCreateSlotClick("2025-11-15", "10:00")}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-headline font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>Schedule Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Category & Status Ribbon */}
      <div className="px-6 py-2.5 bg-surface-container-lowest border-b border-outline-variant/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider mr-1">
            Category:
          </span>
          {["All", "Tech & AI", "Athletics & Fun Runs", "Green & Community", "Workshops & Design", "E-Sports"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-headline font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-surface-container-high text-on-surface border border-outline-variant/60 shadow-2xs"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor: cat === "All" ? "#4b671b" : CATEGORY_COLORS[cat] || "#4b671b",
                  }}
                />
                {cat}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Status:</span>
          {["ALL", "PUBLISHED", "DRAFT"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                selectedStatus === st
                  ? "bg-secondary-container text-on-secondary-fixed"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Success / Info Feedback Banner */}
      {rescheduleSuccessMsg && (
        <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          <span>{rescheduleSuccessMsg}</span>
        </div>
      )}

      {/* VIEW MODE 1: MONTH VIEW */}
      {viewMode === "month" && (
        <div className="bryntum-month-view flex-1 flex flex-col min-h-[580px]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-outline-variant/20 bg-surface-container-low text-center text-xs font-bold text-on-surface-variant font-headline py-2.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="uppercase tracking-wider">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Calendar Grid */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-outline-variant/15 auto-rows-fr bg-surface-container-lowest">
            {monthGridDays.map((cell, idx) => {
              const dayEvents = eventsByDate.get(cell.dateString) || [];
              const isToday = cell.dateString === "2025-11-14";

              return (
                <div
                  key={`${cell.dateString}-${idx}`}
                  className={`min-h-[110px] p-2 flex flex-col transition-colors group relative ${
                    cell.isCurrentMonth ? "bg-surface-container-lowest" : "bg-surface-container-low/40 opacity-50"
                  } ${isToday ? "ring-2 ring-primary/40 ring-inset" : "hover:bg-surface-container-lowest/80"}`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-primary text-on-primary"
                          : cell.isCurrentMonth
                          ? "text-on-surface"
                          : "text-outline"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {!readOnly && onCreateSlotClick && (
                      <button
                        type="button"
                        onClick={() => onCreateSlotClick(cell.dateString, "10:00")}
                        className="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-opacity text-xs p-0.5 rounded cursor-pointer"
                        title="Add event on this date"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[90px] pr-0.5">
                    {dayEvents.map((ev) => {
                      const orig = resolveOriginalEvent(ev.id);
                      const isDraft = ev.status === "DRAFT";

                      return (
                        <div
                          key={ev.id}
                          onClick={() => orig && onEventClick?.(orig)}
                          className="px-2 py-1 rounded-md text-[11px] font-headline font-semibold text-white shadow-2xs truncate cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between gap-1 group/pill"
                          style={{
                            backgroundColor: ev.eventColor || "#4b671b",
                          }}
                          title={`${ev.name} (${ev.startDate.substring(11, 16)} @ ${ev.location})`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="material-symbols-outlined text-[13px] shrink-0">
                              {ev.iconCls || "event"}
                            </span>
                            <span className="truncate">{ev.name}</span>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            {isDraft && (
                              <span className="text-[9px] bg-black/40 px-1 rounded-sm uppercase font-mono">
                                Draft
                              </span>
                            )}
                            {!readOnly && onEventReschedule && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (orig) openRescheduleModal(orig);
                                }}
                                className="opacity-0 group-hover/pill:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity"
                                title="Reschedule event"
                              >
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK VIEW */}
      {viewMode === "week" && (
        <div className="bryntum-week-view flex-1 flex flex-col min-h-[550px] overflow-x-auto">
          {/* Week Header */}
          <div className="grid grid-cols-7 border-b border-outline-variant/20 bg-surface-container-low text-center py-2.5 min-w-[700px]">
            {weekDays.map((day) => {
              const isToday = day.dateString === "2025-11-14";
              return (
                <div key={day.dateString} className="px-2">
                  <div className="text-[11px] font-bold text-outline uppercase">{day.dayName}</div>
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-mono font-extrabold mt-0.5 ${
                      isToday ? "bg-primary text-on-primary" : "text-on-surface"
                    }`}
                  >
                    {day.dayNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Columns */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-outline-variant/15 min-w-[700px] bg-surface-container-lowest">
            {weekDays.map((day) => {
              const dayEvents = eventsByDate.get(day.dateString) || [];
              return (
                <div key={day.dateString} className="p-2 min-h-[450px] flex flex-col gap-2">
                  {dayEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-outline/60 italic font-mono">
                      No events
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const orig = resolveOriginalEvent(ev.id);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => orig && onEventClick?.(orig)}
                          className="p-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/70 hover:bg-surface-container hover:shadow-xs transition-all cursor-pointer flex flex-col gap-1 text-on-surface"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: ev.eventColor }}
                            >
                              {ev.category}
                            </span>
                            <span className="text-[10px] font-mono text-outline">
                              {ev.startDate.substring(11, 16)}
                            </span>
                          </div>

                          <div className="font-headline font-bold text-xs text-on-surface line-clamp-2">
                            {ev.name}
                          </div>

                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1 truncate">
                            <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                            <span className="truncate">{ev.location}</span>
                          </div>

                          {!readOnly && (
                            <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-outline-variant/20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (orig) openRescheduleModal(orig);
                                }}
                                className="text-[11px] font-headline font-bold text-primary hover:underline flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[13px]">schedule</span>
                                <span>Move</span>
                              </button>
                              {orig && onEventEdit && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventEdit(orig);
                                  }}
                                  className="text-[11px] font-headline font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-[13px]">edit</span>
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: DAY VIEW */}
      {viewMode === "day" && (
        <div className="bryntum-day-view p-6 flex-1 bg-surface-container-lowest">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="font-headline font-extrabold text-base text-on-surface">
                Events for {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: MALAYSIA_TIMEZONE })}
              </h3>
              <span className="text-xs font-mono text-outline">
                {eventsByDate.get(currentDate.toISOString().substring(0, 10))?.length || 0} scheduled
              </span>
            </div>

            {(!eventsByDate.get(currentDate.toISOString().substring(0, 10)) ||
              eventsByDate.get(currentDate.toISOString().substring(0, 10))!.length === 0) ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">event_busy</span>
                <p className="text-sm font-headline">No campus events scheduled on this date.</p>
                {!readOnly && onCreateSlotClick && (
                  <button
                    type="button"
                    onClick={() => onCreateSlotClick(currentDate.toISOString().substring(0, 10), "10:00")}
                    className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-headline font-bold cursor-pointer"
                  >
                    Schedule an event now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {eventsByDate.get(currentDate.toISOString().substring(0, 10))!.map((ev) => {
                  const orig = resolveOriginalEvent(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => orig && onEventClick?.(orig)}
                      className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-3 h-12 rounded-full shrink-0"
                          style={{ backgroundColor: ev.eventColor }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-primary">
                              {ev.startDate.substring(11, 16)} – {ev.endDate.substring(11, 16)} MYT
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-surface-container-high text-on-surface-variant">
                              {ev.category}
                            </span>
                          </div>
                          <h4 className="font-headline font-bold text-sm text-on-surface mt-1">
                            {ev.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[15px] text-outline">location_on</span>
                            <span>{ev.location}</span>
                            <span className="mx-1">•</span>
                            <span>{ev.organizer}</span>
                          </p>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (orig) openRescheduleModal(orig);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-headline font-bold text-on-surface hover:bg-surface-container transition-colors"
                          >
                            Reschedule
                          </button>
                          {orig && onEventEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventEdit(orig);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-headline font-bold hover:bg-primary-container transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 4: AGENDA VIEW */}
      {viewMode === "agenda" && (
        <div className="bryntum-agenda-view p-6 flex-1 bg-surface-container-lowest overflow-y-auto max-h-[620px]">
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="font-headline font-extrabold text-lg text-on-surface pb-2 border-b border-outline-variant/20">
              Campus Events Chronological Agenda
            </h3>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <p>No events match the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((ev) => {
                  const orig = resolveOriginalEvent(ev.id);
                  const dateStr = ev.startDate.substring(0, 10);
                  const timeStr = ev.startDate.substring(11, 16);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => orig && onEventClick?.(orig)}
                      className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low/80 hover:bg-surface-container transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 text-center shrink-0">
                          <div className="text-[11px] font-mono font-bold text-outline uppercase">
                            {new Date(dateStr).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                          <div className="text-xl font-mono font-extrabold text-on-surface">
                            {new Date(dateStr).getUTCDate()}
                          </div>
                          <div className="text-[10px] font-mono text-primary font-bold">
                            {timeStr}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase text-white"
                              style={{ backgroundColor: ev.eventColor }}
                            >
                              {ev.category}
                            </span>
                            <span className="text-[11px] font-mono text-outline uppercase">
                              {ev.status}
                            </span>
                          </div>
                          <h4 className="font-headline font-bold text-sm text-on-surface mt-1">
                            {ev.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                            {ev.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-outline mt-1.5">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">location_on</span>
                              <span>{ev.location}</span>
                            </span>
                            <span>•</span>
                            <span>Cap: {ev.totalCapacity || "Unlimited"}</span>
                            <span>•</span>
                            <span>RSVPs: {ev.registeredCount}</span>
                          </div>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (orig) openRescheduleModal(orig);
                            }}
                            className="p-2 rounded-xl text-outline hover:text-primary hover:bg-surface-container transition-colors"
                            title="Reschedule event"
                          >
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                          </button>
                          {orig && onEventEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventEdit(orig);
                              }}
                              className="p-2 rounded-xl text-outline hover:text-secondary hover:bg-surface-container transition-colors"
                              title="Edit in composer"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bryntum Reschedule / Drag & Drop Modal */}
      {reschedulingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                <h3 className="font-headline font-extrabold text-base text-on-surface">
                  Reschedule Campus Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingEvent(null)}
                className="text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div>
              <p className="text-xs text-outline font-label uppercase font-bold">Event</p>
              <h4 className="text-sm font-headline font-bold text-on-surface mt-0.5">
                {reschedulingEvent.title}
              </h4>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{reschedulingEvent.location}</span>
              </p>
            </div>

            {rescheduleError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold flex items-start gap-2">
                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-on-surface font-label mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface font-label mb-1">
                  Start Time (MYT)
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-bold text-on-surface mb-0.5">
                <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                <span>Automatic Conflict Detection</span>
              </div>
              <p>The backend will verify venue availability and organizer overlaps in Asia/Kuala_Lumpur before saving.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingEvent(null)}
                className="px-4 py-2 rounded-xl border border-outline-variant/40 text-xs font-headline font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={isSubmittingReschedule}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary text-xs font-headline font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingReschedule ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    <span>Save New Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
