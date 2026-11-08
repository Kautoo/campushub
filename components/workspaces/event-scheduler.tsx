"use client";

import { useEffect, useRef } from "react";
import "@bryntum/scheduler-community/scheduler.css";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import type { EventRow } from "./event-modal";

type SchedulerInstance = { destroy: () => void };
type SchedulerCtor = new (config: Record<string, unknown>) => SchedulerInstance;

const DAY = 86_400_000;

/**
 * 1:1 Stitch-Themed Bryntum Timeline Scheduler for Campus Events.
 */
export function EventScheduler({
  events,
  licensed,
}: {
  events: EventRow[];
  /** True when BRYNTUM_LICENSE_KEY is configured server-side. */
  licensed: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: SchedulerInstance | null = null;
    let cancelled = false;

    (async () => {
      // Exception: static import is not possible here — Bryntum touches browser globals
      // (window/navigator) during module init, which breaks during Next.js SSR build.
      const mod = await import("@bryntum/scheduler-community");
      if (cancelled || !containerRef.current) return;
      const Scheduler = mod.Scheduler as unknown as SchedulerCtor;

      const dated = events
        .filter((e) => e.start_at)
        .map((e) => {
          const start = new Date(e.start_at as string).getTime();
          const end = e.end_at ? new Date(e.end_at).getTime() : start + 2 * 3_600_000;
          return { ...e, startMs: start, endMs: Math.max(end, start + 3_600_000) };
        });

      const now = Date.now();
      const times = dated.flatMap((e) => [e.startMs, e.endMs]);
      const viewStart = new Date(
        (times.length ? Math.min(...times) : now) - 7 * DAY,
      );
      viewStart.setHours(0, 0, 0, 0);
      const viewEnd = new Date(
        (times.length ? Math.max(...times) : now) + 30 * DAY,
      );
      viewEnd.setHours(23, 59, 59, 0);

      instance = new Scheduler({
        appendTo: containerRef.current,
        startDate: viewStart,
        endDate: viewEnd,
        rowHeight: 48,
        barMargin: 8,
        columns: [
          {
            field: "name",
            text: "Event Initiative",
            width: 260,
          },
        ],
        project: {
          resourceStore: {
            data: dated.map((e) => ({ id: e.id, name: e.title })),
          },
          eventStore: {
            data: dated.map((e) => ({
              id: e.id,
              resourceId: e.id,
              name: e.title,
              startDate: new Date(e.startMs),
              endDate: new Date(e.endMs),
            })),
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [events]);

  return (
    <div className="flex flex-col gap-space-md">
      {/* Header bar matching Stitch Workspace pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-xs gap-3">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 text-on-secondary-container flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">
              calendar_view_week
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                Bryntum Campus Timeline
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-[10px] font-semibold">
                Resource Grid
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Multi-day calendar matrix across university lecture halls and student quads
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!licensed ? (
            <Badge tone="warning" icon="warning">
              Bryntum Trial Mode
            </Badge>
          ) : (
            <Badge tone="success" icon="verified">
              Licensed Enterprise
            </Badge>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon="view_timeline"
          title="Nothing on the timeline"
          body="Events with a start date will appear here once created."
        />
      ) : (
        <div className="rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm bg-surface-container-lowest">
          <div
            ref={containerRef}
            className="bryntum-stitch-theme min-h-[480px] w-full"
          />
        </div>
      )}
    </div>
  );
}
