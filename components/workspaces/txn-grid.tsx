"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { TransactionRow } from "@/lib/db/repo";
import { DataTable } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export type TxnRow = TransactionRow;

const statusTone: Record<string, "success" | "warning" | "error" | "neutral"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  reversed: "error",
};

/** Transactions grid: provider/type/amount/verification badges. */
export function TxnGrid({ rows }: { rows: TxnRow[] }) {
  const columnDefs = useMemo<ColDef<TxnRow>[]>(
    () => [
      {
        field: "provider",
        headerName: "Provider",
        minWidth: 110,
        maxWidth: 140,
        cellRenderer: (p: { value: string }) => (
          <Badge tone="primary">{p.value === "paypal" ? "PayPal" : p.value}</Badge>
        ),
      },
      {
        field: "type",
        headerName: "Type",
        minWidth: 100,
        maxWidth: 130,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={p.value === "refund" ? "warning" : "teal"}>
            {p.value}
          </Badge>
        ),
      },
      {
        field: "amount_cents",
        headerName: "Amount",
        type: "rightAligned",
        minWidth: 120,
        valueFormatter: (p) =>
          formatMoney(Number(p.value), p.data?.currency ?? "MYR"),
      },
      {
        field: "currency",
        headerName: "Currency",
        minWidth: 90,
        maxWidth: 110,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={statusTone[p.value] ?? "neutral"}>{p.value}</Badge>
        ),
      },
      {
        field: "verified",
        headerName: "Verified",
        minWidth: 120,
        maxWidth: 140,
        cellRenderer: (p: { value: boolean }) =>
          p.value ? (
            <Badge tone="teal" icon="verified">
              verified
            </Badge>
          ) : (
            <Badge tone="neutral">unverified</Badge>
          ),
      },
      {
        field: "provider_ref",
        headerName: "Reference",
        minWidth: 170,
        cellClass: "font-mono text-[12px]",
        valueFormatter: (p) => {
          const v = p.value ?? "—";
          return v.length > 18 ? `${v.slice(0, 18)}…` : v;
        },
        tooltipValueGetter: (p) => p.value ?? "",
      },
      {
        field: "created_at",
        headerName: "Date",
        minWidth: 130,
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

  return <DataTable columnDefs={columnDefs} rowData={rows} height={480} />;
}
