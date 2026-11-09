"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridOptions,
} from "ag-grid-community";
import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Native CampusHub 2.0 AG Grid Community Theme (aligned with DESIGN.md).
 * Clean cloud header, 1px subtle dividers, Geist typography, and teal interactive accents.
 */
const campusHubGridTheme = themeQuartz.withParams({
  accentColor: "var(--st-secondary)",
  backgroundColor: "var(--st-surface-lowest)",
  foregroundColor: "var(--st-on-surface)",
  borderColor: "color-mix(in srgb, var(--st-outline-variant) 50%, transparent)",
  wrapperBorder: true,
  wrapperBorderRadius: 14,
  browserColorScheme: "inherit",
  headerBackgroundColor: "var(--st-surface-low)",
  headerTextColor: "var(--st-on-surface-variant)",
  headerFontSize: 11,
  headerFontWeight: 600,
  headerRowBorder: true,
  oddRowBackgroundColor:
    "color-mix(in srgb, var(--st-surface-low) 30%, var(--st-surface-lowest))",
  rowHoverColor:
    "color-mix(in srgb, var(--st-secondary) 5%, var(--st-surface-low))",
  selectedRowBackgroundColor:
    "color-mix(in srgb, var(--st-secondary) 12%, transparent)",
  fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
  fontSize: 13,
  rowBorder: true,
  cellHorizontalPadding: 16,
});

export type DataTableFilterPill = {
  value: string;
  label: string;
};

export function DataTable<T extends { id?: string }>({
  columnDefs,
  rowData,
  gridOptions,
  height = 500,
  rowHeight = 54,
  className,
  showToolbar = true,
  searchPlaceholder = "Filter records across columns…",
  filterField,
  filterPills,
  exportFileName = "campushub-export.csv",
  toolbarSlot,
}: {
  columnDefs: ColDef<T>[];
  rowData: T[];
  gridOptions?: GridOptions<T>;
  height?: number;
  rowHeight?: number;
  className?: string;
  showToolbar?: boolean;
  searchPlaceholder?: string;
  filterField?: keyof T & string;
  filterPills?: DataTableFilterPill[];
  exportFileName?: string;
  toolbarSlot?: React.ReactNode;
}) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [activePill, setActivePill] = useState<string>("all");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 110,
    }),
    [],
  );

  const filteredRows = useMemo(() => {
    if (!filterField || activePill === "all") return rowData;
    return rowData.filter(
      (row) => String(row[filterField] ?? "").toLowerCase() === activePill.toLowerCase(),
    );
  }, [rowData, filterField, activePill]);

  const pillCounts = useMemo(() => {
    if (!filterField || !filterPills) return new Map<string, number>();
    const counts = new Map<string, number>();
    counts.set("all", rowData.length);
    for (const pill of filterPills) {
      if (pill.value === "all") continue;
      const c = rowData.filter(
        (r) => String(r[filterField] ?? "").toLowerCase() === pill.value.toLowerCase(),
      ).length;
      counts.set(pill.value, c);
    }
    return counts;
  }, [rowData, filterField, filterPills]);

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: exportFileName,
    });
  }, [exportFileName]);

  const effectiveRowHeight =
    density === "compact" ? Math.max(40, rowHeight - 12) : rowHeight;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showToolbar ? (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search Input + Optional Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined text-[17px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="focus-aura h-9 w-64 sm:w-72 rounded-lg border border-outline-variant/60 bg-surface-low/70 pl-9 pr-3 text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest transition-colors"
              />
            </div>

            {filterField && filterPills && filterPills.length > 0 ? (
              <div
                className="flex items-center gap-1 flex-wrap"
                role="group"
                aria-label="Filter by status"
              >
                {filterPills.map((pill) => {
                  const active = activePill === pill.value;
                  const count = pillCounts.get(pill.value) ?? 0;
                  return (
                    <button
                      key={pill.value}
                      type="button"
                      onClick={() => setActivePill(pill.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-semibold transition-all",
                        active
                          ? "bg-primary text-on-primary shadow-2xs"
                          : "bg-surface-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                      )}
                    >
                      <span>{pill.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums",
                          active
                            ? "bg-white/20 text-on-primary"
                            : "bg-surface-container-high text-on-surface-variant",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Right: Record Counter + Density Switcher + CSV Export + Custom Slot */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label-sm text-on-surface-variant tabular-nums px-1">
              Showing <strong className="text-on-surface font-semibold">{filteredRows.length}</strong>{" "}
              {filteredRows.length === 1 ? "record" : "records"}
            </span>

            {/* Density Toggle */}
            <div
              className="inline-flex items-center rounded-lg border border-outline-variant/60 bg-surface-low/60 p-0.5"
              role="group"
              aria-label="Row density"
            >
              <button
                type="button"
                onClick={() => setDensity("comfortable")}
                title="Comfortable row spacing"
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-label-sm font-semibold transition-colors",
                  density === "comfortable"
                    ? "bg-surface-lowest text-on-surface shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <span className="material-symbols-outlined text-[14px]">
                  view_agenda
                </span>
                <span className="hidden sm:inline">Relaxed</span>
              </button>
              <button
                type="button"
                onClick={() => setDensity("compact")}
                title="Compact row spacing"
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-label-sm font-semibold transition-colors",
                  density === "compact"
                    ? "bg-surface-lowest text-on-surface shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <span className="material-symbols-outlined text-[14px]">
                  density_small
                </span>
                <span className="hidden sm:inline">Compact</span>
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-lowest px-3 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
            >
              <span className="material-symbols-outlined text-[15px] text-secondary">
                download
              </span>
              <span>Export CSV</span>
            </button>

            {toolbarSlot}
          </div>
        </div>
      ) : null}

      <div
        className="campushub-ag-grid w-full"
        style={{ height, width: "100%" }}
      >
        <AgGridReact<T>
          ref={gridRef}
          theme={campusHubGridTheme}
          columnDefs={columnDefs}
          rowData={filteredRows}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          rowHeight={effectiveRowHeight}
          headerHeight={42}
          getRowId={(p) => String(p.data?.id ?? "")}
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows
          suppressCellFocus
          {...gridOptions}
        />
      </div>
    </div>
  );
}
