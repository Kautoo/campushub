"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { ProductRow as RepoProductRow } from "@/lib/db/repo";
import { DataTable, type DataTableFilterPill } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { formatMoney } from "@/lib/money";
import { MoneyDisplay } from "@/components/ui/currency-context";
import {
  ProductModal,
  type ProductModalRow,
} from "@/components/workspaces/product-modal";
import { ProductStatusButton } from "@/components/workspaces/product-actions";
import { SandboxPromptModal } from "@/components/workspaces/sandbox-prompt-modal";

export type ProductRow = RepoProductRow;

const statusTone: Record<
  ProductRow["status"],
  "success" | "warning" | "neutral"
> = { active: "success", draft: "warning", archived: "neutral" };

const PRODUCT_FILTER_PILLS: DataTableFilterPill[] = [
  { value: "all", label: "All SKUs" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

/** Products AG Grid with product media previews, stock health bars, and SKU management. */
export function ProductGrid({
  rows,
  isReadOnly = false,
}: {
  rows: ProductRow[];
  isReadOnly?: boolean;
}) {
  const [modalProduct, setModalProduct] = useState<ProductModalRow | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [sandboxPromptOpen, setSandboxPromptOpen] = useState(false);

  const openNew = () => {
    if (isReadOnly) {
      setSandboxPromptOpen(true);
      return;
    }
    setModalProduct(null);
    setModalOpen(true);
  };
  const openEdit = (p: ProductModalRow) => {
    if (isReadOnly) {
      setSandboxPromptOpen(true);
      return;
    }
    setModalProduct(p);
    setModalOpen(true);
  };

  const columnDefs = useMemo<ColDef<ProductRow>[]>(
    () => [
      {
        field: "name",
        headerName: "Product & Merch Item",
        minWidth: 250,
        flex: 2.2,
        cellRenderer: (p: { data?: ProductRow }) => {
          const row = p.data;
          if (!row) return null;
          const thumb = row.images?.[0];
          return (
            <div className="flex items-center gap-3 min-w-0 py-1">
              <div className="w-9 h-9 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/40">
                {thumb ? (
                  <div
                    role="img"
                    aria-label={row.name}
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${thumb}')` }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    shopping_bag
                  </span>
                )}
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {row.name}
                </p>
                {row.description ? (
                  <p className="text-body-sm text-on-surface-variant truncate mt-0.5">
                    {row.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        field: "sku",
        headerName: "SKU Code",
        minWidth: 130,
        maxWidth: 155,
        cellRenderer: (p: { value: string | null }) =>
          p.value ? (
            <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-[11.5px] font-medium text-on-surface">
              {p.value}
            </span>
          ) : (
            <span className="text-on-surface-variant">—</span>
          ),
      },
      {
        field: "category",
        headerName: "Category",
        minWidth: 120,
        maxWidth: 150,
        cellRenderer: (p: { value: string | null }) =>
          p.value ? (
            <Badge tone="primary">{p.value}</Badge>
          ) : (
            <span className="text-on-surface-variant">—</span>
          ),
      },
      {
        field: "price_cents",
        headerName: "Unit Price",
        type: "rightAligned",
        minWidth: 120,
        maxWidth: 145,
        cellRenderer: (p: { value: number }) => (
          <span className="tabular-nums font-bold text-primary">
            <MoneyDisplay cents={Number(p.value)} />
          </span>
        ),
      },
      {
        field: "stock",
        headerName: "Inventory Level",
        minWidth: 165,
        maxWidth: 195,
        cellRenderer: (p: { data?: ProductRow }) => {
          const row = p.data;
          if (!row) return null;
          const low = row.stock <= row.low_stock_threshold;
          const pct = Math.min(
            100,
            Math.round((row.stock / Math.max(row.low_stock_threshold * 4, 40)) * 100),
          );
          return (
            <div className="w-full space-y-1 tabular-nums">
              <div className="flex items-center justify-between gap-2 text-body-sm">
                <span className="font-semibold text-on-surface">
                  {row.stock} <span className="text-on-surface-variant font-normal">units</span>
                </span>
                {low ? (
                  <Badge
                    tone={row.stock === 0 ? "error" : "warning"}
                    icon="warning"
                  >
                    {row.stock === 0 ? "Out" : "Low"}
                  </Badge>
                ) : (
                  <span className="text-[11px] text-success font-semibold">
                    Healthy
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    row.stock === 0
                      ? "bg-error"
                      : low
                        ? "bg-warning"
                        : "bg-secondary"
                  }`}
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
        minWidth: 115,
        maxWidth: 135,
        cellRenderer: (p: { value: ProductRow["status"] }) => (
          <Badge tone={statusTone[p.value]}>{p.value}</Badge>
        ),
      },
      {
        headerName: "Actions",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 245,
        maxWidth: 270,
        cellRenderer: (p: { data?: ProductRow }) => {
          const row = p.data;
          if (!row) return null;
          return (
            <span className="flex h-full items-center gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2.5 py-1 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
              >
                <Icon name="edit" size={14} />
                Edit
              </button>
              {row.status === "active" || row.status === "archived" ? (
                <ProductStatusButton id={row.id} status={row.status} />
              ) : (
                <span className="text-label-sm text-on-surface-variant px-2">
                  draft
                </span>
              )}
              {row.status === "active" ? (
                <a
                  href={`/demo/products/${row.slug}`}
                  target="_blank"
                  title="View live on storefront"
                  className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-lowest px-2 py-1 text-label-sm font-semibold text-secondary hover:bg-surface-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                </a>
              ) : null}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface">
            Merchandise &amp; SKU Catalog
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            Manage retail pricing, stock thresholds, and storefront visibility across official society gear.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isReadOnly ? (
            <button
              type="button"
              onClick={() => setSandboxPromptOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-container text-warning text-label-sm font-bold border border-warning/40 hover:bg-warning-container/80 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Showcase (Read-Only)</span>
            </button>
          ) : null}
          <Link
            href="/demo/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-lowest px-4 py-2 text-label-md font-semibold text-on-surface hover:bg-surface-low transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              visibility
            </span>
            <span>Preview Storefront</span>
            <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
              open_in_new
            </span>
          </Link>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-label-md font-semibold text-on-primary shadow-xs transition-all hover:opacity-90"
          >
            <Icon name="add" size={16} />
            New product
          </button>
        </div>
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
              className="rounded-full bg-primary px-5 py-2 text-label-lg font-semibold text-on-primary"
            >
              New product
            </button>
          }
          className="m-4 border-dashed"
        />
      ) : (
        <DataTable
          columnDefs={columnDefs}
          rowData={rows}
          height={520}
          searchPlaceholder="Search products by name, SKU code, or category…"
          filterField="status"
          filterPills={PRODUCT_FILTER_PILLS}
          exportFileName="campushub-products.csv"
        />
      )}
      {modalOpen ? (
        <ProductModal product={modalProduct} onClose={() => setModalOpen(false)} />
      ) : null}

      <SandboxPromptModal
        isOpen={sandboxPromptOpen}
        onClose={() => setSandboxPromptOpen(false)}
      />
    </div>
  );
}
