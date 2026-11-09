"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import "@bryntum/core-community/fontawesome/css/fontawesome.css";
import "@bryntum/core-community/fontawesome/css/solid.css";
import "@bryntum/scheduler-community/scheduler.css";
import "@bryntum/scheduler-community/svalbard.css";
import { Badge, type ChipTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { setEventStatus, updateEvent } from "@/app/actions/events";
import type { EventRow } from "./event-modal";

type SchedulerInstance = {
  destroy: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: (options?: Record<string, unknown>) => void;
  shiftPrevious: () => void;
  shiftNext: () => void;
  scrollToDate: (date: Date, options?: Record<string, unknown>) => Promise<void>;
  viewPreset: string;
  startDate: Date;
  endDate: Date;
  eventStore: {
    filter: (fn: (record: Record<string, unknown>) => boolean) => void;
    clearFilters: () => void;
  };
};

type SchedulerCtor = new (config: Record<string, unknown>) => SchedulerInstance;

export type ViewPresetKey = "day" | "week" | "multiweek" | "semester";
export type ResourceGroupMode = "venue" | "category" | "initiative";
export type SchedulerOrientation = "horizontal" | "vertical";

const DAY = 86_400_000;

const PRESET_MAP: Record<
  ViewPresetKey,
  { id: string; label: string; icon: string; spanDays: number; rowHeight: number }
> = {
  day: {
    id: "hourAndDay",
    label: "Day",
    icon: "schedule",
    spanDays: 3,
    rowHeight: 76,
  },
  week: {
    id: "dayAndWeek",
    label: "Week",
    icon: "view_week",
    spanDays: 14,
    rowHeight: 76,
  },
  multiweek: {
    id: "weekAndDayLetter",
    label: "Multi-Week",
    icon: "calendar_view_month",
    spanDays: 60,
    rowHeight: 74,
  },
  semester: {
    id: "weekAndMonth",
    label: "Semester",
    icon: "date_range",
    spanDays: 150,
    rowHeight: 70,
  },
};

const STATUS_META: Record<
  string,
  { label: string; badge: string; tone: ChipTone; dotColor: string }
> = {
  published: {
    label: "Published",
    badge: "LIVE",
    tone: "teal",
    dotColor: "var(--st-secondary)",
  },
  draft: {
    label: "Draft",
    badge: "DRAFT",
    tone: "warning",
    dotColor: "var(--st-warning)",
  },
  completed: {
    label: "Completed",
    badge: "DONE",
    tone: "primary",
    dotColor: "var(--st-primary)",
  },
  cancelled: {
    label: "Cancelled",
    badge: "VOID",
    tone: "error",
    dotColor: "var(--st-error)",
  },
};

const VENUE_ICONS: Record<string, string> = {
  "Main Hall, Block C": "stadium",
  "Lab 2, CS Building": "terminal",
  "Innovation Lab": "memory",
  "Exhibition Hall B": "storefront",
  "Auditorium 1": "theaters",
};

function escapeHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeRange(startIso: string | null, endIso: string | null): string {
  if (!startIso) return "Unscheduled";
  const s = new Date(startIso);
  if (Number.isNaN(s.getTime())) return "Unscheduled";
  const e = endIso ? new Date(endIso) : null;
  const sDate = s.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  const sTime = s.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
  if (!e || Number.isNaN(e.getTime())) return `${sDate} · ${sTime}`;
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) {
    const eTime = e.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
    return `${sDate} · ${sTime} – ${eTime}`;
  }
  const eDate = e.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  return `${sDate} → ${eDate}`;
}

/**
 * Native CampusHub 2.0 Bryntum Scheduler & Calendar Timeline Workspace.
 * Supports Venue / Category / Initiative tracks, Day / Week / Multi-Week / Semester presets,
 * Horizontal Timeline & Vertical Calendar orientations, drag-and-drop rescheduling,
 * and rich CampusHub event cards & inspection dialogs.
 */
export function EventScheduler({
  events,
  licensed,
  onEditEvent,
  onCreateEvent,
}: {
  events: EventRow[];
  /** True when BRYNTUM_LICENSE_KEY is configured server-side. */
  licensed: boolean;
  onEditEvent?: (event: EventRow) => void;
  onCreateEvent?: (defaults?: Partial<EventRow>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const schedulerRef = useRef<SchedulerInstance | null>(null);

  const [preset, setPreset] = useState<ViewPresetKey>("multiweek");
  const [groupMode, setGroupMode] = useState<ResourceGroupMode>("venue");
  const [orientation, setOrientation] = useState<SchedulerOrientation>("horizontal");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customDateRangeLabel, setCustomDateRangeLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Filtered events for display & metrics
  const datedEvents = useMemo(() => {
    const fallbackBaseMs = 1_772_323_200_000;
    return events
      .filter((e) => Boolean(e.start_at))
      .map((e, idx) => {
        const start = new Date(e.start_at as string).getTime();
        const safeStart = Number.isNaN(start) ? fallbackBaseMs + idx * DAY : start;
        const rawEnd = e.end_at ? new Date(e.end_at).getTime() : safeStart + 6 * 3_600_000;
        const safeEnd =
          Number.isNaN(rawEnd) || rawEnd <= safeStart
            ? safeStart + 6 * 3_600_000
            : rawEnd;
        return {
          ...e,
          venueLabel: e.venue?.trim() || "Campus Central Quad",
          categoryLabel: (e.category?.trim() || "general").toLowerCase(),
          startMs: safeStart,
          endMs: safeEnd,
        };
      });
  }, [events]);

  const visibleEvents = useMemo(() => {
    return datedEvents.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchVenue = e.venueLabel.toLowerCase().includes(q);
        const matchCat = e.categoryLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchVenue && !matchCat) return false;
      }
      return true;
    });
  }, [datedEvents, statusFilter, searchQuery]);

  // Selected event for the native CampusHub Inspector Drawer
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  // Summary telemetry metrics
  const telemetry = useMemo(() => {
    const venues = new Set(datedEvents.map((e) => e.venueLabel)).size;
    const totalCapacity = datedEvents.reduce((s, e) => s + (e.capacity || 0), 0);
    const totalSold = datedEvents.reduce((s, e) => s + (e.total_sold || 0), 0);
    const utilizationPct =
      totalCapacity > 0 ? Math.min(100, Math.round((totalSold / totalCapacity) * 100)) : 0;
    const publishedCount = datedEvents.filter((e) => e.status === "published").length;
    return {
      totalScheduled: datedEvents.length,
      venues,
      totalCapacity,
      totalSold,
      utilizationPct,
      publishedCount,
    };
  }, [datedEvents]);

  const defaultDateRangeLabel = useMemo(() => {
    if (visibleEvents.length === 0) return "Semester Horizon";
    const activeEvents = visibleEvents.filter((e) => e.status !== "completed");
    const anchorTimes = (activeEvents.length ? activeEvents : visibleEvents).flatMap(
      (e) => [e.startMs, e.endMs],
    );
    const minTime = Math.min(...anchorTimes);
    const maxTime = Math.max(...anchorTimes);
    const presetConfig = PRESET_MAP[preset];
    const viewStart = new Date(minTime - 4 * DAY);
    const viewEnd = new Date(
      Math.max(maxTime + 10 * DAY, viewStart.getTime() + presetConfig.spanDays * DAY),
    );
    return `${formatShortDate(viewStart)} – ${formatShortDate(viewEnd)}`;
  }, [visibleEvents, preset]);

  const dateRangeLabel = customDateRangeLabel ?? defaultDateRangeLabel;

  // Persist schedule update via server action when dragged/resized in Bryntum
  const persistEventChange = (
    eventRow: EventRow,
    newStart: Date,
    newEnd: Date,
    newVenue?: string,
  ) => {
    startTransition(async () => {
      const res = await updateEvent(eventRow.id, {
        title: eventRow.title,
        slug: eventRow.slug,
        description: eventRow.description ?? "",
        venue: newVenue ?? eventRow.venue ?? "",
        category: (eventRow.category ?? "") as string,
        start_at: newStart.toISOString(),
        end_at: newEnd.toISOString(),
        capacity: eventRow.capacity,
        status: eventRow.status as "draft" | "published" | "cancelled" | "completed",
      });
      if (res?.error) {
        notify(`Could not update schedule: ${res.error}`);
      } else {
        notify(`Rescheduled "${eventRow.title}" → ${formatShortDate(newStart)}`);
      }
    });
  };
  const callbacksRef = useRef({ onEditEvent, onCreateEvent, persistEventChange });
  useEffect(() => {
    callbacksRef.current = { onEditEvent, onCreateEvent, persistEventChange };
  });

  useEffect(() => {
    let instance: SchedulerInstance | null = null;
    let cancelled = false;

    (async () => {
      // Exception: static import is not possible here — Bryntum touches browser globals
      // (window/navigator) during module init, which breaks during Next.js SSR build.
      const mod = await import("@bryntum/scheduler-community");
      if (cancelled || !containerRef.current) return;
      const Scheduler = mod.Scheduler as unknown as SchedulerCtor;

      containerRef.current.innerHTML = "";

      if (visibleEvents.length === 0) return;

      const now = Date.now();
      const activeEvents = visibleEvents.filter((e) => e.status !== "completed");
      const anchorTimes = (activeEvents.length ? activeEvents : visibleEvents).flatMap(
        (e) => [e.startMs, e.endMs],
      );
      const minTime = anchorTimes.length ? Math.min(...anchorTimes) : now;
      const maxTime = anchorTimes.length ? Math.max(...anchorTimes) : now + 30 * DAY;

      const presetConfig = PRESET_MAP[preset];
      const viewStart = new Date(minTime - 4 * DAY);
      viewStart.setHours(0, 0, 0, 0);
      const viewEnd = new Date(
        Math.max(maxTime + 10 * DAY, viewStart.getTime() + presetConfig.spanDays * DAY),
      );
      viewEnd.setHours(23, 59, 59, 0);

      // Initial date window label is derived via defaultDateRangeLabel

      // Build resources based on groupMode
      type ResourceItem = {
        id: string;
        name: string;
        subtitle: string;
        icon: string;
        capacity: number;
        sold: number;
        eventCount: number;
      };

      const resources: ResourceItem[] = [];
      if (groupMode === "venue") {
        const byVenue = new Map<string, typeof visibleEvents>();
        for (const ev of visibleEvents) {
          const list = byVenue.get(ev.venueLabel) ?? [];
          list.push(ev);
          byVenue.set(ev.venueLabel, list);
        }
        for (const [venueName, list] of byVenue.entries()) {
          const cap = list.reduce((s, e) => s + (e.capacity || 0), 0);
          const sold = list.reduce((s, e) => s + (e.total_sold || 0), 0);
          resources.push({
            id: `venue:${venueName}`,
            name: venueName,
            subtitle: `${list.length} scheduled ${list.length === 1 ? "event" : "events"}`,
            icon: VENUE_ICONS[venueName] ?? "location_on",
            capacity: cap,
            sold,
            eventCount: list.length,
          });
        }
      } else if (groupMode === "category") {
        const byCat = new Map<string, typeof visibleEvents>();
        for (const ev of visibleEvents) {
          const list = byCat.get(ev.categoryLabel) ?? [];
          list.push(ev);
          byCat.set(ev.categoryLabel, list);
        }
        for (const [catName, list] of byCat.entries()) {
          const cap = list.reduce((s, e) => s + (e.capacity || 0), 0);
          const sold = list.reduce((s, e) => s + (e.total_sold || 0), 0);
          resources.push({
            id: `cat:${catName}`,
            name: catName.charAt(0).toUpperCase() + catName.slice(1) + " Track",
            subtitle: `${list.length} ${list.length === 1 ? "initiative" : "initiatives"}`,
            icon: "category",
            capacity: cap,
            sold,
            eventCount: list.length,
          });
        }
      } else {
        for (const ev of visibleEvents) {
          resources.push({
            id: ev.id,
            name: ev.title,
            subtitle: ev.venueLabel,
            icon: "confirmation_number",
            capacity: ev.capacity || 0,
            sold: ev.total_sold || 0,
            eventCount: 1,
          });
        }
      }

      const eventRecords = visibleEvents.map((e) => ({
        id: e.id,
        resourceId:
          groupMode === "venue"
            ? `venue:${e.venueLabel}`
            : groupMode === "category"
              ? `cat:${e.categoryLabel}`
              : e.id,
        name: e.title,
        startDate: new Date(e.startMs),
        endDate: new Date(e.endMs),
        venue: e.venueLabel,
        category: e.categoryLabel,
        status: e.status,
        capacity: e.capacity || 0,
        sold: e.total_sold || 0,
        rawEvent: e,
      }));

      const columnHeaderTitle =
        groupMode === "venue"
          ? "Campus Venue / Facility"
          : groupMode === "category"
            ? "Academic / Program Track"
            : "Event Initiative";

      instance = new Scheduler({
        appendTo: containerRef.current,
        cls: "campushub-bryntum",
        mode: orientation,
        viewPreset: presetConfig.id,
        startDate: viewStart,
        endDate: viewEnd,
        rowHeight: presetConfig.rowHeight,
        barMargin: 8,
        eventStyle: "plain",
        eventColor: null,
        useInitialAnimation: false,
         resourceColumnsWidth: 190,
        columns: [
          {
            field: "name",
            text: columnHeaderTitle,
            width: 280,
            htmlEncode: false,
            renderer: ({ record }: { record: Record<string, unknown> }) => {
              const name = escapeHtml(String(record.name ?? ""));
              const subtitle = escapeHtml(String(record.subtitle ?? ""));
              const icon = escapeHtml(String(record.icon ?? "event"));
              const cap = Number(record.capacity ?? 0);
              const sold = Number(record.sold ?? 0);
              const pct = cap > 0 ? Math.min(100, Math.round((sold / cap) * 100)) : 0;

              return `
                <div class="flex items-center justify-between w-full py-1.5 gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-secondary-container/45 text-on-secondary-container flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-[17px]">${icon}</span>
                    </div>
                    <div class="min-w-0 flex flex-col">
                      <span class="text-[13px] font-semibold text-on-surface truncate leading-tight">${name}</span>
                      <span class="text-[11px] text-on-surface-variant truncate mt-0.5">${subtitle}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end shrink-0 tabular-nums">
                    <span class="text-[11px] font-semibold text-primary">${sold}/${cap}</span>
                    <div class="w-12 h-1.5 rounded-full bg-surface-container-high overflow-hidden mt-1">
                      <div class="h-full rounded-full bg-secondary" style="width:${pct}%"></div>
                    </div>
                  </div>
                </div>
              `;
            },
          },
        ],
        features: {
          columnLines: true,
          stripe: true,
          eventDrag: {
            constrainDragToTimeline: false,
          },
          eventResize: true,
          eventDragCreate: true,
          eventEdit: true,
          eventTooltip: {
            align: "b-t",
            template: ({ eventRecord }: { eventRecord: Record<string, unknown> }) => {
              const title = escapeHtml(String(eventRecord.name ?? ""));
              const venue = escapeHtml(String(eventRecord.venue ?? "Campus Quad"));
              const category = escapeHtml(String(eventRecord.category ?? "event"));
              const status = String(eventRecord.status ?? "draft");
              const meta = STATUS_META[status] ?? STATUS_META.draft;
              const sold = Number(eventRecord.sold ?? 0);
              const cap = Number(eventRecord.capacity ?? 0);
              const pct = cap > 0 ? Math.min(100, Math.round((sold / cap) * 100)) : 0;
              const startD = eventRecord.startDate as Date;
              const endD = eventRecord.endDate as Date;
              const rangeStr = formatDateTimeRange(
                startD ? startD.toISOString() : null,
                endD ? endD.toISOString() : null,
              );

              return `
                <div class="p-3 min-w-[240px] max-w-[300px] space-y-2.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface">
                      <span class="w-1.5 h-1.5 rounded-full" style="background:${meta.dotColor}"></span>
                      ${escapeHtml(meta.label)}
                    </span>
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-secondary">${category}</span>
                  </div>
                  <div>
                    <p class="text-[14px] font-bold text-on-surface leading-snug">${title}</p>
                    <p class="text-[12px] text-on-surface-variant mt-0.5">${escapeHtml(rangeStr)}</p>
                  </div>
                  <div class="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-[15px] text-secondary">location_on</span>
                    <span>${venue}</span>
                  </div>
                  <div class="pt-2 border-t border-outline-variant/40">
                    <div class="flex items-center justify-between text-[11px] tabular-nums mb-1">
                      <span class="text-on-surface-variant">Pass registrations</span>
                      <span class="font-semibold text-on-surface">${sold} / ${cap} (${pct}%)</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div class="h-full rounded-full bg-secondary" style="width:${pct}%"></div>
                    </div>
                  </div>
                  <p class="text-[10px] text-on-surface-variant pt-0.5">
                    Click card to inspect · Drag to reschedule · Double-click to edit
                  </p>
                </div>
              `;
            },
          },
        },
        eventRenderer: ({
          eventRecord,
        }: {
          eventRecord: Record<string, unknown>;
        }) => {
          const title = escapeHtml(String(eventRecord.name ?? ""));
          const venue = escapeHtml(String(eventRecord.venue ?? "Campus Quad"));
          const category = escapeHtml(String(eventRecord.category ?? "event"));
          const status = String(eventRecord.status ?? "draft");
          const meta = STATUS_META[status] ?? STATUS_META.draft;
          const sold = Number(eventRecord.sold ?? 0);
          const cap = Number(eventRecord.capacity ?? 0);
          const pct = cap > 0 ? Math.min(100, Math.round((sold / cap) * 100)) : 0;

          return `
            <div class="ch-bryntum-event-card" data-status="${escapeHtml(status)}">
              <div class="flex items-center justify-between gap-1.5 min-w-0">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:${meta.dotColor}"></span>
                  <span class="text-[12.5px] font-semibold text-on-surface truncate leading-tight">${title}</span>
                </div>
                <span class="px-1.5 py-0.2 rounded text-[9.5px] font-bold tracking-wider uppercase bg-surface-container/90 text-on-surface-variant shrink-0">
                  ${escapeHtml(meta.badge)}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2 mt-1 text-[11px] text-on-surface-variant min-w-0">
                <span class="truncate">${venue} · <strong class="font-medium text-secondary">${category}</strong></span>
                <span class="tabular-nums font-semibold text-on-surface shrink-0">${sold}/${cap} (${pct}%)</span>
              </div>
              <div class="w-full h-1 rounded-full bg-surface-container-high/80 overflow-hidden mt-1">
                <div class="h-full rounded-full" style="width:${pct}%;background:${meta.dotColor}"></div>
              </div>
            </div>
          `;
        },
        listeners: {
          eventClick: ({ eventRecord }: { eventRecord: Record<string, unknown> }) => {
            const id = String(eventRecord.id ?? "");
            if (id) setSelectedEventId(id);
          },
          beforeEventEdit: ({
            eventRecord,
            resourceRecord,
          }: {
            eventRecord: Record<string, unknown>;
            resourceRecord?: Record<string, unknown>;
          }) => {
            const raw = eventRecord.rawEvent as EventRow | undefined;
            const { onEditEvent: editFn, onCreateEvent: createFn } = callbacksRef.current;
            if (raw && editFn) {
              editFn(raw);
              return false;
            }
            if (!raw && createFn) {
              const startD = eventRecord.startDate as Date | undefined;
              const endD = eventRecord.endDate as Date | undefined;
              const resId = String(resourceRecord?.id ?? "");
              const inferredVenue = resId.startsWith("venue:")
                ? resId.slice("venue:".length)
                : undefined;
              createFn({
                start_at: startD ? startD.toISOString() : null,
                end_at: endD ? endD.toISOString() : null,
                venue: inferredVenue ?? null,
              });
              return false;
            }
            if (raw) {
              setSelectedEventId(raw.id);
              return false;
            }
            return false;
          },
          afterEventDrop: ({
            eventRecords: dropped,
            valid,
          }: {
            eventRecords?: Array<Record<string, unknown>>;
            valid?: boolean;
          }) => {
            if (!valid || !dropped?.length) return;
            const rec = dropped[0];
            const raw = rec.rawEvent as EventRow | undefined;
            const startD = rec.startDate as Date | undefined;
            const endD = rec.endDate as Date | undefined;
            const resId = String(rec.resourceId ?? "");
            const nextVenue = resId.startsWith("venue:")
              ? resId.slice("venue:".length)
              : undefined;
            if (raw && startD && endD) {
              callbacksRef.current.persistEventChange(raw, startD, endD, nextVenue);
            }
          },
          eventResizeEnd: ({
            eventRecord,
          }: {
            eventRecord?: Record<string, unknown>;
          }) => {
            if (!eventRecord) return;
            const raw = eventRecord.rawEvent as EventRow | undefined;
            const startD = eventRecord.startDate as Date | undefined;
            const endD = eventRecord.endDate as Date | undefined;
            if (raw && startD && endD) {
              callbacksRef.current.persistEventChange(raw, startD, endD);
            }
          },
        },
        project: {
          resourceStore: {
            data: resources,
          },
          eventStore: {
            data: eventRecords,
          },
        },
      });

      schedulerRef.current = instance;
    })();

    return () => {
      cancelled = true;
      schedulerRef.current = null;
      instance?.destroy();
    };
  }, [visibleEvents, preset, groupMode, orientation]);

  const handleShift = (dir: "prev" | "next") => {
    const s = schedulerRef.current;
    if (!s) return;
    if (dir === "prev") s.shiftPrevious();
    else s.shiftNext();
    if (s.startDate && s.endDate) {
      setCustomDateRangeLabel(`${formatShortDate(s.startDate)} – ${formatShortDate(s.endDate)}`);
    }
  };

  const handleJumpFocus = () => {
    const s = schedulerRef.current;
    if (!s) return;
    const firstUpcoming =
      visibleEvents.find((e) => e.status === "published") ?? visibleEvents[0];
    const target = firstUpcoming ? new Date(firstUpcoming.startMs) : new Date();
    void s.scrollToDate(target, { block: "center", animate: 300 });
  };

  const handleToggleStatus = (ev: EventRow) => {
    const nextStatus = ev.status === "published" ? "draft" : "published";
    startTransition(async () => {
      const res = await setEventStatus(ev.id, nextStatus);
      if (res?.error) notify(res.error);
      else notify(`Event "${ev.title}" marked as ${nextStatus}.`);
    });
  };

  const handleQuickShiftDays = (ev: EventRow, deltaDays: number) => {
    if (!ev.start_at) return;
    const s = new Date(new Date(ev.start_at).getTime() + deltaDays * DAY);
    const e = ev.end_at
      ? new Date(new Date(ev.end_at).getTime() + deltaDays * DAY)
      : new Date(s.getTime() + 6 * 3_600_000);
    persistEventChange(ev, s, e);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ============================================================
          1. SCHEDULER TELEMETRY & ENGINE HEADER BAR
          ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-outline-variant/40">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px] text-secondary-fixed">
              calendar_view_week
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-headline-sm font-bold text-on-surface">
                Campus Venue &amp; Initiative Timeline
              </h3>
              <Badge tone="teal" icon="hub">
                Bryntum Scheduler 8.0
              </Badge>
              {!licensed ? (
                <Badge tone="warning" icon="verified_user">
                  Community Edition
                </Badge>
              ) : (
                <Badge tone="success" icon="verified">
                  Enterprise Licensed
                </Badge>
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Drag events to reschedule dates or reassign venues, resize duration bars, or double-click any slot to edit.
            </p>
          </div>
        </div>

        {/* Telemetry Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="rounded-xl border border-outline-variant/40 bg-surface-low/70 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Active Venues
            </span>
            <span className="text-headline-sm font-bold text-primary tabular-nums">
              {telemetry.venues}
            </span>
          </div>
          <div className="rounded-xl border border-outline-variant/40 bg-surface-low/70 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Live Events
            </span>
            <span className="text-headline-sm font-bold text-secondary tabular-nums">
              {telemetry.publishedCount} / {telemetry.totalScheduled}
            </span>
          </div>
          <div className="rounded-xl border border-outline-variant/40 bg-surface-low/70 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Passes Sold
            </span>
            <span className="text-headline-sm font-bold text-on-surface tabular-nums">
              {telemetry.totalSold.toLocaleString()}
            </span>
          </div>
          <div className="rounded-xl border border-outline-variant/40 bg-surface-low/70 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Fill Rate
            </span>
            <span className="text-headline-sm font-bold text-success tabular-nums">
              {telemetry.utilizationPct}%
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. CUSTOM CAMPUSHUB SCHEDULER CONTROL TOOLBAR
          ============================================================ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-surface-low/60 p-3">
        {/* Left: Date Navigation + View Preset Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Stepping */}
          <div className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-lowest p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleShift("prev")}
              title="Previous time window"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleJumpFocus}
              className="px-2.5 h-8 text-label-md font-semibold text-primary hover:bg-surface-container rounded-md transition-colors"
            >
              Focus Active
            </button>
            <button
              type="button"
              onClick={() => handleShift("next")}
              title="Next time window"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Active Date Window Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/40 bg-surface-lowest px-3 h-9 text-label-md text-on-surface tabular-nums">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              date_range
            </span>
            <span>{dateRangeLabel}</span>
          </div>

          {/* Horizon Preset Switcher */}
          <div
            className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-lowest p-0.5"
            role="group"
            aria-label="Timeline horizon preset"
          >
            {(Object.keys(PRESET_MAP) as ViewPresetKey[]).map((key) => {
              const item = PRESET_MAP[key];
              const active = preset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPreset(key)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 h-8 text-label-md font-semibold transition-all ${
                    active
                      ? "bg-primary text-on-primary shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Track Grouping + Orientation + Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Resource Track Grouping */}
          <div
            className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-lowest p-0.5"
            role="group"
            aria-label="Resource track grouping"
          >
            {(
              [
                { key: "venue", label: "By Venue", icon: "location_on" },
                { key: "category", label: "By Track", icon: "category" },
                { key: "initiative", label: "By Event", icon: "confirmation_number" },
              ] as const
            ).map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroupMode(g.key)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 h-8 text-label-md font-semibold transition-all ${
                  groupMode === g.key
                    ? "bg-secondary-container text-on-secondary-container shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>

          {/* Orientation Switcher: Timeline vs Vertical Calendar */}
          <div
            className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-lowest p-0.5"
            role="group"
            aria-label="Schedule orientation"
          >
            <button
              type="button"
              onClick={() => setOrientation("horizontal")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 h-8 text-label-md font-semibold transition-all ${
                orientation === "horizontal"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Horizontal Resource Timeline"
            >
              <span className="material-symbols-outlined text-[15px]">view_timeline</span>
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setOrientation("vertical")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 h-8 text-label-md font-semibold transition-all ${
                orientation === "vertical"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Vertical Calendar Columns"
            >
              <span className="material-symbols-outlined text-[15px]">calendar_view_day</span>
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          {/* Zoom & Fit Controls */}
          <div className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-lowest p-0.5">
            <button
              type="button"
              onClick={() => schedulerRef.current?.zoomOut()}
              title="Zoom out timeline"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[17px]">zoom_out</span>
            </button>
            <button
              type="button"
              onClick={() =>
                schedulerRef.current?.zoomToFit({
                  leftMargin: 24,
                  rightMargin: 24,
                })
              }
              title="Fit all events in view"
              className="px-2 h-8 text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => schedulerRef.current?.zoomIn()}
              title="Zoom in timeline"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[17px]">zoom_in</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. SEARCH, STATUS FILTER PILLS & LEGEND BAR
          ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined text-[17px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheduled events or venues…"
              aria-label="Search scheduled events or venues"
              className="focus-aura h-9 w-64 rounded-lg border border-outline-variant/60 bg-surface-lowest pl-9 pr-3 text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: "all", label: "All", count: datedEvents.length },
                {
                  key: "published",
                  label: "Published",
                  count: datedEvents.filter((e) => e.status === "published").length,
                },
                {
                  key: "draft",
                  label: "Draft",
                  count: datedEvents.filter((e) => e.status === "draft").length,
                },
                {
                  key: "completed",
                  label: "Completed",
                  count: datedEvents.filter((e) => e.status === "completed").length,
                },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-semibold transition-all ${
                  statusFilter === f.key
                    ? "bg-primary text-on-primary shadow-2xs"
                    : "bg-surface-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                    statusFilter === f.key
                      ? "bg-white/20 text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            Published (Live)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            Draft Hold
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            Completed
          </span>
        </div>
      </div>

      {/* Live Toast Feedback for Drag/Resize/Status updates */}
      {toastMessage ? (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-xl border border-secondary/40 bg-secondary-container/25 px-4 py-2.5 text-body-sm font-medium text-on-surface"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-label-sm text-on-surface-variant hover:text-on-surface"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* ============================================================
          4. BRYNTUM SCHEDULER CANVAS + NATIVE EVENT INSPECTOR PANEL
          ============================================================ */}
      {visibleEvents.length === 0 ? (
        <EmptyState
          icon="view_timeline"
          title="No matching scheduled events"
          body={
            searchQuery || statusFilter !== "all"
              ? "Try clearing your search query or switching the status filter."
              : "Events with a start date will appear on the interactive timeline once created."
          }
          action={
            searchQuery || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="rounded-full bg-primary px-4 py-2 text-label-md font-semibold text-on-primary"
              >
                Reset filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div
            className={
              selectedEvent ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"
            }
          >
            <div className="rounded-2xl border border-outline-variant/50 overflow-hidden shadow-xs bg-surface-lowest">
              <div
                ref={containerRef}
                className="campushub-bryntum bryntum-stitch-theme min-h-[500px] w-full"
              />
            </div>
          </div>

          {/* Native CampusHub Event Inspector Card (opens when an event card is clicked) */}
          {selectedEvent ? (
            <aside
              aria-label="Selected event inspector"
              className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-outline-variant/60 bg-surface-lowest p-5 shadow-md space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        (STATUS_META[selectedEvent.status]?.tone as ChipTone) ??
                        "neutral"
                      }
                    >
                      {STATUS_META[selectedEvent.status]?.label ??
                        selectedEvent.status}
                    </Badge>
                    {selectedEvent.category ? (
                      <Badge tone="neutral">{selectedEvent.category}</Badge>
                    ) : null}
                  </div>
                  <h4 className="text-headline-sm font-bold text-on-surface pt-1">
                    {selectedEvent.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  aria-label="Close inspector"
                  className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>

              {selectedEvent.description ? (
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {selectedEvent.description}
                </p>
              ) : null}

              <dl className="space-y-2.5 rounded-xl bg-surface-low p-3.5 text-body-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      location_on
                    </span>
                    Venue
                  </dt>
                  <dd className="font-semibold text-on-surface text-right">
                    {selectedEvent.venue || "Campus Quad"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      schedule
                    </span>
                    Schedule
                  </dt>
                  <dd className="font-medium text-on-surface text-right tabular-nums">
                    {formatDateTimeRange(
                      selectedEvent.start_at,
                      selectedEvent.end_at,
                    )}
                  </dd>
                </div>
                <div className="pt-2 border-t border-outline-variant/40">
                  <div className="flex items-center justify-between text-label-sm mb-1.5 tabular-nums">
                    <span className="text-on-surface-variant">
                      Ticket Sell-Through
                    </span>
                    <span className="font-bold text-primary">
                      {selectedEvent.total_sold} / {selectedEvent.capacity} sold (
                      {selectedEvent.capacity > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (selectedEvent.total_sold /
                                selectedEvent.capacity) *
                                100,
                            ),
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{
                        width: `${
                          selectedEvent.capacity > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (selectedEvent.total_sold /
                                    selectedEvent.capacity) *
                                    100,
                                ),
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </dl>

              {/* Quick Reschedule Stepping */}
              <div>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant block mb-2">
                  Quick Reschedule Cadence
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickShiftDays(selectedEvent, -1)}
                    className="rounded-lg border border-outline-variant/60 bg-surface-lowest py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-low disabled:opacity-50"
                  >
                    −1 Day
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickShiftDays(selectedEvent, 1)}
                    className="rounded-lg border border-outline-variant/60 bg-surface-lowest py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-low disabled:opacity-50"
                  >
                    +1 Day
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickShiftDays(selectedEvent, 7)}
                    className="rounded-lg border border-outline-variant/60 bg-surface-lowest py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-low disabled:opacity-50"
                  >
                    +1 Week
                  </button>
                </div>
              </div>

              {/* Primary Inspector Actions */}
              <div className="flex flex-col gap-2 pt-1">
                {onEditEvent ? (
                  <button
                    type="button"
                    onClick={() => onEditEvent(selectedEvent)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit_calendar
                    </span>
                    Edit Event Details
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggleStatus(selectedEvent)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-lowest py-2 px-4 text-label-md font-semibold text-on-surface hover:bg-surface-low transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    {selectedEvent.status === "published"
                      ? "unpublished"
                      : "publish"}
                  </span>
                  {selectedEvent.status === "published"
                    ? "Move to Draft Hold"
                    : "Publish to Storefront"}
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}
