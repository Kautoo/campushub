"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { TransactionRow } from "@/lib/db/repo";
import { DataTable, type DataTableFilterPill } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export type TxnRow = TransactionRow;

const statusTone: Record<string, "success" | "warning" | "error" | "neutral"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  reversed: "error",
};

const TXN_FILTER_PILLS: DataTableFilterPill[] = [
  { value: "all", label: "All Entries" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

/** Transactions AG Grid: provider, capture reference, amount, and webhook verification badges. */
export function TxnGrid({ rows }: { rows: TxnRow[] }) {
  const columnDefs = useMemo<ColDef<TxnRow>[]>(
    () => [
      {
        field: "provider_ref",
        headerName: "Gateway Reference",
        minWidth: 175,
        flex: 1.3,
        cellRenderer: (p: { data?: TxnRow }) => {
          const ref = p.data?.provider_ref ?? "—";
          return (
            <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-[12px] font-medium text-on-surface">
              {ref}
            </span>
          );
        },
        tooltipValueGetter: (p) => p.value ?? "",
      },
      {
        field: "provider",
        headerName: "Gateway",
        minWidth: 120,
        maxWidth: 145,
        cellRenderer: (p: { value: string }) => (
          <Badge tone="primary" icon="account_balance_wallet">
            {p.value === "paypal" ? "PayPal v2" : p.value}
          </Badge>
        ),
      },
      {
        field: "type",
        headerName: "Ledger Type",
        minWidth: 115,
        maxWidth: 140,
        cellRenderer: (p: { value: string }) => (
          <Badge
            tone={p.value === "refund" ? "warning" : "teal"}
            icon={p.value === "refund" ? "currency_exchange" : "south_west"}
          >
            {p.value}
          </Badge>
        ),
      },
      {
        field: "amount_cents",
        headerName: "Settlement Amount",
        type: "rightAligned",
        minWidth: 145,
        maxWidth: 170,
        cellRenderer: (p: { data?: TxnRow }) => {
          if (!p.data) return null;
          const isRefund = p.data.type === "refund";
          return (
            <span
              className={`tabular-nums font-bold ${
                isRefund ? "text-warning" : "text-primary"
              }`}
            >
              {isRefund ? "−" : "+"}
              {formatMoney(Number(p.data.amount_cents), p.data.currency ?? "MYR")}
            </span>
          );
        },
      },
      {
        field: "currency",
        headerName: "CCY",
        minWidth: 85,
        maxWidth: 100,
        cellClass: "font-mono text-[12px] text-on-surface-variant",
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 125,
        maxWidth: 145,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={statusTone[p.value] ?? "neutral"}>{p.value}</Badge>
        ),
      },
      {
        field: "verified",
        headerName: "Webhook HMAC",
        minWidth: 140,
        maxWidth: 165,
        cellRenderer: (p: { value: boolean }) =>
          p.value ? (
            <Badge tone="teal" icon="verified">
              HMAC Verified
            </Badge>
          ) : (
            <Badge tone="neutral" icon="schedule">
              Awaiting Hook
            </Badge>
          ),
      },
      {
        field: "created_at",
        headerName: "Captured At",
        minWidth: 140,
        maxWidth: 160,
        valueFormatter: (p) =>
          new Date(p.value).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
    ],
    [],
  );

  return (
    <div className="p-5">
      <DataTable
        columnDefs={columnDefs}
        rowData={rows}
        height={520}
        searchPlaceholder="Search capture reference, gateway, status, or amount…"
        filterField="status"
        filterPills={TXN_FILTER_PILLS}
        exportFileName="campushub-transactions.csv"
      />
    </div>
  );
}
