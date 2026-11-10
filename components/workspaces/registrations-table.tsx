"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { DataTable, type DataTableFilterPill } from "@/components/grid/data-table";
import { Badge, type ChipTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { MoneyDisplay } from "@/components/ui/currency-context";
import {
  RegistrationActions,
  type RegistrationStatus,
} from "./registration-actions";

export type RegistrationRow = {
  id: string;
  attendee_name: string;
  attendee_email: string;
  event: string;
  tier: string;
  qty: number;
  amount_cents: number;
  status: RegistrationStatus;
  checkin_at: string | null;
  created_at: string;
};

const statusTones: Record<string, ChipTone> = {
  pending: "warning",
  confirmed: "success",
  checked_in: "teal",
  cancelled: "error",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  cancelled: "Cancelled",
};

const REGISTRATION_FILTER_PILLS: DataTableFilterPill[] = [
  { value: "all", label: "All Passes" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

/** Registrations AG Grid with attendee avatars, tier badges, and gate check-in actions. */
export function RegistrationsTable({ rows }: { rows: RegistrationRow[] }) {
  const columnDefs = useMemo<ColDef<RegistrationRow>[]>(
    () => [
      {
        headerName: "Attendee",
        minWidth: 230,
        flex: 1.6,
        valueGetter: (p) =>
          p.data ? `${p.data.attendee_name} · ${p.data.attendee_email}` : "",
        cellRenderer: (p: { data?: RegistrationRow }) => {
          if (!p.data) return null;
          const initials = p.data.attendee_name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3 min-w-0 py-1">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-label-sm font-bold shrink-0">
                {initials || "ST"}
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {p.data.attendee_name}
                </p>
                <p className="text-body-sm text-on-surface-variant truncate mt-0.5">
                  {p.data.attendee_email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Event & Ticket Tier",
        minWidth: 220,
        flex: 1.5,
        valueGetter: (p) => (p.data ? `${p.data.event} ${p.data.tier}` : ""),
        cellRenderer: (p: { data?: RegistrationRow }) => {
          if (!p.data) return null;
          return (
            <div className="leading-tight min-w-0 py-1">
              <p className="text-body-md font-medium text-on-surface truncate">
                {p.data.event}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center rounded-md bg-surface-container px-2 py-0.2 text-[11px] font-semibold text-primary">
                  {p.data.tier}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        field: "qty",
        headerName: "Qty",
        maxWidth: 85,
        type: "rightAligned",
        cellClass: "tabular-nums font-semibold",
      },
      {
        headerName: "Fee Settled",
        maxWidth: 140,
        type: "rightAligned",
        valueGetter: (p) => p.data?.amount_cents ?? 0,
        cellRenderer: (p: { value: number }) => (
          <span className="tabular-nums font-bold text-primary">
            {p.value === 0 ? "Free Pass" : <MoneyDisplay cents={Number(p.value)} />}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Gate Status",
        maxWidth: 145,
        cellRenderer: (p: { value: RegistrationStatus }) => (
          <Badge
            tone={statusTones[p.value] ?? "neutral"}
            icon={
              p.value === "checked_in"
                ? "verified"
                : p.value === "confirmed"
                  ? "check_circle"
                  : undefined
            }
          >
            {statusLabels[p.value] ?? p.value}
          </Badge>
        ),
      },
      {
        headerName: "Registered",
        maxWidth: 145,
        valueGetter: (p) => p.data?.created_at ?? "",
        valueFormatter: (p) =>
          new Date(p.value).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      {
        headerName: "Gate Check-In & Actions",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 245,
        maxWidth: 265,
        cellRenderer: (p: { data?: RegistrationRow }) =>
          p.data ? (
            <RegistrationActions id={p.data.id} status={p.data.status} />
          ) : null,
      },
    ],
    [],
  );

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="how_to_reg"
        title="No registrations yet"
        body="Registrations appear here once attendees grab tickets on the storefront."
      />
    );
  }

  return (
    <DataTable
      columnDefs={columnDefs}
      rowData={rows}
      height={560}
      searchPlaceholder="Search attendee name, student email, event, or tier…"
      filterField="status"
      filterPills={REGISTRATION_FILTER_PILLS}
      exportFileName="campushub-registrations.csv"
    />
  );
}
