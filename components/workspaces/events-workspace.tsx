"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import type { ColDef } from "ag-grid-community";
import { DataTable, type DataTableFilterPill } from "@/components/grid/data-table";
import { Badge, type ChipTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@heroui/react";
import { Icon } from "@/components/ui/icon";
import { setEventStatus } from "@/app/actions/events";
import { EventModal, type EventRow } from "./event-modal";

// Bryntum Scheduler is loaded lazily and browser-only (touches window on init).
const EventScheduler = dynamic(
  () => import("./event-scheduler").then((m) => m.EventScheduler),
  {
    ssr: false,
    loading: () => (
      <div className="h-[540px] animate-pulse rounded-2xl border border-outline-variant/50 bg-surface-low flex items-center justify-center text-body-sm text-on-surface-variant">
        Loading Bryntum Scheduler timeline…
      </div>
    ),
  },
);

export type { EventRow } from "./event-modal";

const statusTones: Record<string, ChipTone> = {
  draft: "warning",
  published: "success",
  cancelled: "error",
  completed: "teal",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

const EVENT_FILTER_PILLS: DataTableFilterPill[] = [
  { value: "all", label: "All Events" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "completed", label: "Completed" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/**
 * Events workspace shell: seamlessly integrates AG Grid Community (data table ledger)
 * and Bryntum Scheduler (venue timeline & calendar views), plus create/edit modal.
 */
export function EventsWorkspace({
  rows,
  licensed,
}: {
  rows: EventRow[];
  licensed: boolean;
}) {
  const [tab, setTab] = useState<"list" | "timeline">("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const openCreate = (defaults?: Partial<EventRow>) => {
    if (defaults) {
      setEditing({
        id: "",
        title: defaults.title ?? "",
        slug: defaults.slug ?? "",
        description: defaults.description ?? null,
        venue: defaults.venue ?? null,
        category: defaults.category ?? "conference",
        start_at: defaults.start_at ?? null,
        end_at: defaults.end_at ?? null,
        capacity: defaults.capacity ?? 150,
        status: defaults.status ?? "draft",
        total_sold: 0,
      });
    } else {
      setEditing(undefined);
    }
    setModalOpen(true);
  };

  const openEdit = (row: EventRow) => {
    setEditing(row);
    setModalOpen(true);
  };

  const togglePublish = (row: EventRow) => {
    setBusyId(row.id);
    startTransition(async () => {
      await setEventStatus(
        row.id,
        row.status === "published" ? "draft" : "published",
      );
      setBusyId(null);
    });
  };

  const columnDefs = useMemo<ColDef<EventRow>[]>(
    () => [
      {
        field: "title",
        headerName: "Event Initiative & Venue",
        minWidth: 260,
        flex: 2,
        cellRenderer: (p: { data?: EventRow }) => {
          const row = p.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-3 py-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/45 text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[17px]">
                  confirmation_number
                </span>
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {row.title}
                </p>
                <p className="text-body-sm text-on-surface-variant truncate mt-0.5">
                  {row.venue || "Campus Quad"} ·{" "}
                  <span className="font-mono text-[11px]">{row.slug}</span>
                </p>
              </div>
            </div>
          );
        },
      },
      {
        field: "category",
        headerName: "Track",
        minWidth: 130,
        maxWidth: 155,
        cellRenderer: (p: { value: string | null }) =>
          p.value ? (
            <Badge tone="primary">{p.value}</Badge>
          ) : (
            <span className="text-on-surface-variant">—</span>
          ),
      },
      {
        headerName: "Schedule Window",
        minWidth: 210,
        valueGetter: (p) => p.data?.start_at ?? "",
        cellRenderer: (p: { data?: EventRow }) => {
          if (!p.data) return null;
          return (
            <div className="leading-tight tabular-nums">
              <p className="text-body-sm font-medium text-on-surface">
                {formatDate(p.data.start_at)}
              </p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {p.data.end_at ? `Ends ${formatDate(p.data.end_at)}` : "Single session"}
              </p>
            </div>
          );
        },
      },
      {
        headerName: "Capacity & Sell-Through",
        minWidth: 190,
        maxWidth: 220,
        valueGetter: (p) => p.data?.total_sold ?? 0,
        cellRenderer: (p: { data?: EventRow }) => {
          const row = p.data;
          if (!row) return null;
          const cap = row.capacity || 0;
          const sold = row.total_sold || 0;
          const pct = cap > 0 ? Math.min(100, Math.round((sold / cap) * 100)) : 0;
          return (
            <div className="w-full space-y-1 tabular-nums">
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-semibold text-on-surface">
                  {sold.toLocaleString()}{" "}
                  <span className="text-on-surface-variant font-normal">
                    / {cap.toLocaleString()}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-secondary">
                  {pct}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        maxWidth: 150,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={statusTones[p.value] ?? "neutral"}>
            {statusLabels[p.value] ?? p.value}
          </Badge>
        ),
      },
      {
        headerName: "Actions",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 245,
        maxWidth: 270,
        cellRenderer: (p: { data?: EventRow }) => {
          if (!p.data) return null;
          const row = p.data;
          const published = row.status === "published";
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2.5 py-1 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  edit
                </span>
                Edit
              </button>
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => togglePublish(row)}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary-container/40 px-2.5 py-1 text-label-sm font-semibold text-on-secondary-container hover:bg-secondary-container/70 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {published ? "unpublished" : "publish"}
                </span>
                {published ? "Unpublish" : "Publish"}
              </button>
              {published ? (
                <a
                  href={`/demo/events/${row.slug}`}
                  target="_blank"
                  title="View live on storefront"
                  className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2 py-1 text-label-sm font-semibold text-secondary hover:bg-surface-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                </a>
              ) : null}
            </div>
          );
        },
      },
    ],
    [busyId],
  );

  return (
    <div className="space-y-4">
      {/* Top Mode Bar: Switch between AG Grid Ledger and Bryntum Timeline & Calendar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant/50 bg-surface-lowest p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-xl border border-outline-variant/60 bg-surface-low p-1"
            role="tablist"
            aria-label="Event workspace views"
          >
            {(
              [
                {
                  key: "list",
                  label: "Events Ledger (AG Grid)",
                  icon: "table_chart",
                },
                {
                  key: "timeline",
                  label: "Schedule & Calendar (Bryntum)",
                  icon: "view_timeline",
                },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={
                  tab === t.key
                    ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary shadow-xs transition-all"
                    : "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-label-md font-medium text-on-surface-variant hover:text-on-surface transition-all"
                }
              >
                <Icon name={t.icon} size={16} />
                {t.label}
              </button>
            ))}
          </div>
          <span className="hidden xl:inline text-body-sm text-on-surface-variant">
            {tab === "list"
              ? "Tabular event management, sell-through metrics, and instant status controls."
              : "Interactive multi-track venue scheduling, calendar presets, and drag-and-drop timeline."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/demo/events"
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-lowest px-4 text-label-md font-semibold text-on-surface hover:bg-surface-low transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              visibility
            </span>
            <span>Preview Storefront</span>
            <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
              open_in_new
            </span>
          </Link>
          <Button
            variant="primary"
            onPress={() => openCreate()}
            className="h-10 rounded-full px-5 text-label-lg font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New event
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="event_busy"
          title="No events yet"
          body="Create your first campus event to start selling tickets and scheduling venues."
          action={
            <Button
              variant="primary"
              onPress={() => openCreate()}
              className="h-10 rounded-full px-5 text-label-lg"
            >
              New event
            </Button>
          }
        />
      ) : tab === "list" ? (
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-5 shadow-xs">
          <DataTable
            columnDefs={columnDefs}
            rowData={rows}
            height={520}
            searchPlaceholder="Search events by title, venue, track, or slug…"
            filterField="status"
            filterPills={EVENT_FILTER_PILLS}
            exportFileName="campushub-events.csv"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-5 shadow-xs">
          <EventScheduler
            events={rows}
            licensed={licensed}
            onEditEvent={openEdit}
            onCreateEvent={openCreate}
          />
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editing?.id ? editing : undefined}
      />
    </div>
  );
}
