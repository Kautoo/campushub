"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import type { ColDef } from "ag-grid-community";
import { DataTable } from "@/components/grid/data-table";
import { Badge, type ChipTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@heroui/react";
import { Icon } from "@/components/ui/icon";
import { setEventStatus } from "@/app/actions/events";
import { EventModal, type EventRow } from "./event-modal";

// Bryntum Scheduler is a large commercial bundle; it is only rendered on the
// Timeline tab, so load its chunk lazily and browser-only.
const EventScheduler = dynamic(() => import("./event-scheduler").then((m) => m.EventScheduler), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] animate-pulse rounded-xl border border-outline-variant bg-surface-container" />
  ),
});

export type { EventRow } from "./event-modal";

const statusTones: Record<string, ChipTone> = {
  draft: "neutral",
  published: "success",
  cancelled: "error",
  completed: "teal",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

/** Events workspace shell: List / Timeline tabs, event grid, create/edit modal. */
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

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };
  const openEdit = (row: EventRow) => {
    setEditing(row);
    setModalOpen(true);
  };

  const togglePublish = (row: EventRow) => {
    setBusyId(row.id);
    startTransition(async () => {
      await setEventStatus(row.id, row.status === "published" ? "draft" : "published");
      setBusyId(null);
    });
  };

  const columnDefs = useMemo<ColDef<EventRow>[]>(
    () => [
      { field: "title", headerName: "Event", minWidth: 220 },
      {
        field: "category",
        headerName: "Category",
        maxWidth: 150,
        cellRenderer: (p: { value: string | null }) =>
          p.value ? <Badge tone="primary">{p.value}</Badge> : <span className="text-on-surface-variant">—</span>,
      },
      {
        headerName: "Dates",
        sortable: false,
        filter: false,
        minWidth: 200,
        valueGetter: (p) => p.data?.start_at ?? "",
        cellRenderer: (p: { data?: EventRow }) => {
          if (!p.data) return null;
          return (
            <span className="whitespace-nowrap text-body-sm text-on-surface-variant">
              {formatDate(p.data.start_at)}
              {p.data.end_at ? ` → ${formatDate(p.data.end_at)}` : ""}
            </span>
          );
        },
      },
      {
        field: "capacity",
        headerName: "Capacity",
        maxWidth: 120,
        type: "rightAligned",
      },
      {
        field: "total_sold",
        headerName: "Sold",
        maxWidth: 100,
        type: "rightAligned",
      },
      {
        field: "status",
        headerName: "Status",
        maxWidth: 140,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={statusTones[p.value] ?? "neutral"}>{p.value}</Badge>
        ),
      },
      {
        headerName: "",
        sortable: false,
        filter: false,
        width: 200,
        cellRenderer: (p: { data?: EventRow }) => {
          if (!p.data) return null;
          const row = p.data;
          const published = row.status === "published";
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Edit
              </button>
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => togglePublish(row)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm text-primary hover:bg-surface-container disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {published ? "unpublished" : "publish"}
                </span>
                {published ? "Unpublish" : "Publish"}
              </button>
            </div>
          );
        },
      },
    ],
    [busyId],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-outline-variant bg-surface-lowest p-1">
          {(
            [
              { key: "list", label: "List", icon: "view_list" },
              { key: "timeline", label: "Timeline", icon: "view_timeline" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                tab === t.key
                  ? "inline-flex items-center gap-1.5 rounded-full bg-primary-container px-4 py-1.5 text-label-md text-white dark:bg-primary/15 dark:text-primary"
                  : "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-label-md text-on-surface-variant hover:bg-surface-container"
              }
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          onPress={openCreate}
          className="h-10 rounded-full px-5 text-label-lg"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New event
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="event_busy"
          title="No events yet"
          body="Create your first campus event to start selling tickets."
          action={
            <Button
              variant="primary"
              onPress={openCreate}
              className="h-10 rounded-full px-5 text-label-lg"
            >
              New event
            </Button>
          }
        />
      ) : tab === "list" ? (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <DataTable columnDefs={columnDefs} rowData={rows} height={520} />
        </div>
      ) : (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <EventScheduler events={rows} licensed={licensed} />
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editing}
      />
    </div>
  );
}
