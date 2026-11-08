"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { DataTable } from "@/components/grid/data-table";
import { Badge, type ChipTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { RegistrationActions, type RegistrationStatus } from "./registration-actions";

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

/** Registrations grid with per-row status + check-in actions. */
export function RegistrationsTable({ rows }: { rows: RegistrationRow[] }) {
  const columnDefs = useMemo<ColDef<RegistrationRow>[]>(
    () => [
      {
        headerName: "Attendee",
        minWidth: 200,
        valueGetter: (p) =>
          p.data ? `${p.data.attendee_name} · ${p.data.attendee_email}` : "",
        cellRenderer: (p: { data?: RegistrationRow }) => {
          if (!p.data) return null;
          return (
            <div className="leading-tight">
              <p className="text-body-sm font-medium text-on-surface">
                {p.data.attendee_name}
              </p>
              <p className="text-body-sm text-on-surface-variant">{p.data.attendee_email}</p>
            </div>
          );
        },
      },
      { field: "event", headerName: "Event", minWidth: 180 },
      { field: "tier", headerName: "Tier", minWidth: 130 },
      {
        field: "qty",
        headerName: "Qty",
        maxWidth: 80,
        type: "rightAligned",
      },
      {
        headerName: "Amount",
        maxWidth: 140,
        type: "rightAligned",
        valueGetter: (p) => p.data?.amount_cents ?? 0,
        valueFormatter: (p) => formatMoney(Number(p.value)),
      },
      {
        field: "status",
        headerName: "Status",
        maxWidth: 140,
        cellRenderer: (p: { value: RegistrationStatus }) => (
          <Badge tone={statusTones[p.value] ?? "neutral"}>
            {statusLabels[p.value] ?? p.value}
          </Badge>
        ),
      },
      {
        headerName: "Created",
        maxWidth: 150,
        valueGetter: (p) => p.data?.created_at ?? "",
        valueFormatter: (p) =>
          new Date(p.value).toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
      },
      {
        headerName: "",
        sortable: false,
        filter: false,
        width: 260,
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

  return <DataTable columnDefs={columnDefs} rowData={rows} height={560} />;
}
