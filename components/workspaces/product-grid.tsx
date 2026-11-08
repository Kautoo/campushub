"use client";

import { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { ProductRow as RepoProductRow } from "@/lib/db/repo";
import { DataTable } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { formatMoney } from "@/lib/money";
import {
  ProductModal,
  type ProductModalRow,
} from "@/components/workspaces/product-modal";
import { ProductStatusButton } from "@/components/workspaces/product-actions";

export type ProductRow = RepoProductRow;

const statusTone: Record<
  ProductRow["status"],
  "success" | "warning" | "neutral"
> = { active: "success", draft: "warning", archived: "neutral" };

/** Products grid with create/edit modal and archive/activate actions. */
export function ProductGrid({ rows }: { rows: ProductRow[] }) {
  const [modalProduct, setModalProduct] = useState<ProductModalRow | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const openNew = () => {
    setModalProduct(null);
    setModalOpen(true);
  };
  const openEdit = (p: ProductModalRow) => {
    setModalProduct(p);
    setModalOpen(true);
  };
  const close = () => setModalOpen(false);

  const columnDefs = useMemo<ColDef<ProductRow>[]>(
    () => [
      { field: "name", headerName: "Name", minWidth: 200, flex: 2 },
      {
        field: "sku",
        headerName: "SKU",
        minWidth: 120,
        cellClass: "font-mono text-[12px]",
        valueFormatter: (p) => p.value ?? "—",
      },
      {
        field: "category",
        headerName: "Category",
        minWidth: 130,
        valueFormatter: (p) => p.value ?? "—",
      },
      {
        field: "price_cents",
        headerName: "Price",
        type: "rightAligned",
        minWidth: 110,
        maxWidth: 140,
        valueFormatter: (p) => formatMoney(Number(p.value)),
      },
      {
        field: "stock",
        headerName: "Stock",
        type: "rightAligned",
        minWidth: 130,
        maxWidth: 170,
        cellRenderer: (p: { data?: ProductRow }) => {
          const row = p.data;
          if (!row) return null;
          const low = row.stock <= row.low_stock_threshold;
          return (
            <span className="inline-flex items-center gap-2">
              <span>{row.stock}</span>
              {low ? (
                <Badge tone={row.stock === 0 ? "error" : "warning"} icon="warning">
                  {row.stock === 0 ? "out" : "low"}
                </Badge>
              ) : null}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 110,
        maxWidth: 130,
        cellRenderer: (p: { value: ProductRow["status"] }) => (
          <Badge tone={statusTone[p.value]}>{p.value}</Badge>
        ),
      },
      {
        headerName: "",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 210,
        maxWidth: 230,
        cellRenderer: (p: { data?: ProductRow }) => {
          const row = p.data;
          if (!row) return null;
          return (
            <span className="flex h-full items-center gap-1">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-3 py-1 text-label-md text-ink-variant hover:bg-surface-container hover:text-ink"
              >
                <Icon name="edit" size={14} />
                Edit
              </button>
              {row.status === "active" || row.status === "archived" ? (
                <ProductStatusButton id={row.id} status={row.status} />
              ) : (
                <span className="text-label-sm text-muted">draft</span>
              )}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-headline-sm text-ink">All products</h3>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-label-lg font-semibold text-[var(--accent-foreground)] transition-transform hover:-translate-y-0.5"
        >
          <Icon name="add" size={16} />
          New product
        </button>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="No products yet"
          body="Create your first product to start selling on the storefront."
          action={
            <button
              type="button"
              onClick={openNew}
              className="rounded-full bg-[var(--accent)] px-5 py-2 text-label-lg font-semibold text-[var(--accent-foreground)]"
            >
              New product
            </button>
          }
          className="m-4 border-dashed"
        />
      ) : (
        <DataTable columnDefs={columnDefs} rowData={rows} height={480} />
      )}
      {modalOpen ? (
        <ProductModal product={modalProduct} onClose={close} />
      ) : null}
    </>
  );
}
