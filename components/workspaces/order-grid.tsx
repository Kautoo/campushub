"use client";

import { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { OrderItemRow, OrderRow } from "@/lib/db/repo";
import { DataTable, type DataTableFilterPill } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { OrderDetail } from "@/components/workspaces/order-detail";

export type OrderItemLine = Pick<
  OrderItemRow,
  "name_snapshot" | "qty" | "unit_price_cents"
>;

export type OrderWithItems = OrderRow & {
  order_items: OrderItemLine[];
};

const statusTone: Record<string, "success" | "warning" | "neutral" | "error" | "teal"> = {
  paid: "success",
  fulfilled: "teal",
  pending: "warning",
  cancelled: "neutral",
  refunded: "error",
};

const ORDER_FILTER_PILLS: DataTableFilterPill[] = [
  { value: "all", label: "All Orders" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
];

/** Orders AG Grid; clicking a row or Inspect opens the slide-over detail drawer. */
export function OrderGrid({ rows }: { rows: OrderWithItems[] }) {
  const [selected, setSelected] = useState<OrderWithItems | null>(null);

  const columnDefs = useMemo<ColDef<OrderWithItems>[]>(
    () => [
      {
        field: "order_number",
        headerName: "Order ID",
        minWidth: 140,
        maxWidth: 165,
        cellRenderer: (p: { data?: OrderWithItems }) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-[12px] font-semibold text-primary">
                {p.data.order_number}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Customer / Student",
        minWidth: 220,
        flex: 1.6,
        valueGetter: (p) =>
          p.data
            ? `${p.data.customer_name ?? ""} ${p.data.customer_email}`
            : "",
        cellRenderer: (p: { data?: OrderWithItems }) => {
          const row = p.data;
          if (!row) return null;
          const initials = (row.customer_name ?? row.customer_email ?? "ST")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-2.5 min-w-0 py-1">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-label-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {row.customer_name ?? "Campus Buyer"}
                </p>
                <p className="text-body-sm text-on-surface-variant truncate mt-0.5">
                  {row.customer_email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Line Items",
        minWidth: 230,
        flex: 1.8,
        valueGetter: (p) => {
          const items = p.data?.order_items ?? [];
          if (items.length === 0) return "—";
          const first = items[0];
          return items.length > 1
            ? `${first.qty}× ${first.name_snapshot} +${items.length - 1} more`
            : `${first.qty}× ${first.name_snapshot}`;
        },
        cellRenderer: (p: { data?: OrderWithItems }) => {
          const items = p.data?.order_items ?? [];
          if (items.length === 0) {
            return <span className="text-on-surface-variant">—</span>;
          }
          const first = items[0];
          const totalUnits = items.reduce((s, i) => s + i.qty, 0);
          return (
            <div className="leading-tight min-w-0 py-1">
              <p className="text-body-md font-medium text-on-surface truncate">
                {first.qty}× {first.name_snapshot}
              </p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 tabular-nums">
                {items.length > 1
                  ? `+${items.length - 1} more line(s) · ${totalUnits} total units`
                  : `${totalUnits} ${totalUnits === 1 ? "unit" : "units"}`}
              </p>
            </div>
          );
        },
      },
      {
        field: "total_cents",
        headerName: "Total Settled",
        type: "rightAligned",
        minWidth: 135,
        maxWidth: 160,
        cellRenderer: (p: { data?: OrderWithItems }) => {
          if (!p.data) return null;
          return (
            <div className="text-right leading-tight tabular-nums">
              <p className="text-body-md font-bold text-primary">
                {formatMoney(p.data.total_cents, p.data.currency)}
              </p>
              <p className="text-[10.5px] text-on-surface-variant">
                incl. {formatMoney(p.data.fee_cents, p.data.currency)} fee
              </p>
            </div>
          );
        },
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
        field: "created_at",
        headerName: "Date",
        minWidth: 125,
        maxWidth: 145,
        valueFormatter: (p) =>
          new Date(p.value).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      {
        headerName: "",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 120,
        maxWidth: 135,
        cellRenderer: (p: { data?: OrderWithItems }) =>
          p.data ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (p.data) setSelected(p.data);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2.5 py-1 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
            >
              <span>Inspect</span>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
            </button>
          ) : null,
      },
    ],
    [],
  );

  return (
    <div className="p-5">
      <DataTable<OrderWithItems>
        columnDefs={columnDefs}
        rowData={rows}
        height={540}
        searchPlaceholder="Search by order number, student name, email, or item…"
        filterField="status"
        filterPills={ORDER_FILTER_PILLS}
        exportFileName="campushub-orders.csv"
        gridOptions={{
          rowSelection: { mode: "singleRow", checkboxes: false },
          onRowClicked: (e) => {
            if (e.data) setSelected(e.data);
          },
          rowClass: "cursor-pointer",
        }}
      />
      {selected ? (
        <OrderDetail order={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
