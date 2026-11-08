"use client";

import { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { OrderItemRow, OrderRow } from "@/lib/db/repo";
import { DataTable } from "@/components/grid/data-table";
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

const statusTone: Record<string, "success" | "warning" | "neutral" | "error"> = {
  paid: "success",
  fulfilled: "success",
  pending: "warning",
  cancelled: "neutral",
  refunded: "error",
};

/** Orders grid; clicking a row opens the detail drawer. */
export function OrderGrid({ rows }: { rows: OrderWithItems[] }) {
  const [selected, setSelected] = useState<OrderWithItems | null>(null);

  const columnDefs = useMemo<ColDef<OrderWithItems>[]>(
    () => [
      {
        field: "order_number",
        headerName: "Order",
        minWidth: 150,
        cellClass: "font-mono text-[12px]",
      },
      {
        headerName: "Customer",
        minWidth: 170,
        flex: 2,
        valueGetter: (p) =>
          p.data?.customer_name ?? p.data?.customer_email ?? "—",
      },
      {
        headerName: "Items",
        minWidth: 200,
        flex: 2,
        valueGetter: (p) => {
          const items = p.data?.order_items ?? [];
          if (items.length === 0) return "—";
          const first = items[0];
          return items.length > 1
            ? `${first.qty}× ${first.name_snapshot} +${items.length - 1} more`
            : `${first.qty}× ${first.name_snapshot}`;
        },
      },
      {
        field: "total_cents",
        headerName: "Total",
        type: "rightAligned",
        minWidth: 120,
        valueFormatter: (p) =>
          formatMoney(Number(p.value), p.data?.currency ?? "MYR"),
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

  return (
    <>
      <DataTable<OrderWithItems>
        columnDefs={columnDefs}
        rowData={rows}
        height={520}
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
    </>
  );
}
