"use client";

import { useEffect, useRef } from "react";
import "@bryntum/scheduler-community/scheduler.css";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import type { EventRow } from "./event-modal";

type SchedulerInstance = { destroy: () => void };
type SchedulerCtor = new (config: Record<string, unknown>) => SchedulerInstance;

const DAY = 86_400_000;

/** Timeline tab: real events rendered on a Bryntum Scheduler (vanilla build via ref). */
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
      // Static import is not possible here: Bryntum's module init touches
      // browser globals, so it must stay off the SSR code path of this
      // client component (loaded only in the effect, browser-only).
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
        rowHeight: 44,
        barMargin: 6,
        columns: [{ field: "name", text: "Event", width: 240 }],
        project: {
          // One resource row per event; each event bar renders on its own row.
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
    <div className="space-y-3">
      {!licensed ? (
        <Badge tone="warning" icon="warning">
          Bryntum trial — unlicensed
        </Badge>
      ) : null}
      {events.length === 0 ? (
        <EmptyState
          icon="view_timeline"
          title="Nothing on the timeline"
          body="Events with a start date will appear here once created."
        />
      ) : (
        <div
          ref={containerRef}
          className="rounded-xl border border-outline-variant bg-surface-lowest"
        />
      )}
    </div>
  );
}
