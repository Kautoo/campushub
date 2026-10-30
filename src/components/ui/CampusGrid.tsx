"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  SelectionChangedEvent,
} from "ag-grid-community";

// Register all Community modules (strictly community-only, no enterprise)
ModuleRegistry.registerModules([AllCommunityModule]);

export const campushubGridTheme = themeQuartz.withParams({
  accentColor: "#4b671b",
  backgroundColor: "#ffffff",
  foregroundColor: "#131b2e",
  headerBackgroundColor: "#faf8ff",
  headerTextColor: "#44483b",
  headerFontWeight: 600,
  rowHoverColor: "#f2f3ff",
  selectedRowBackgroundColor: "#eaedff",
  borderColor: "rgba(196, 200, 183, 0.25)",
  borderRadius: 14,
  wrapperBorderRadius: 18,
  fontFamily: "inherit",
  fontSize: 13,
});

export interface CampusGridProps<T = unknown> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  quickSearchPlaceholder?: string;
  onRefresh?: () => void;
  enableExport?: boolean;
  exportFileName?: string;
  onRowSelected?: (selectedRow: T | null) => void;
  getRowId?: (params: { data: T }) => string;
  paginationPageSize?: number;
  height?: string | number;
  extraToolbarActions?: React.ReactNode;
  onGridReady?: (params: GridReadyEvent<T>) => void;
}

export function CampusGrid<T = unknown>({
  rowData,
  columnDefs,
  loading = false,
  error = null,
  title,
  subtitle,
  quickSearchPlaceholder = "Quick search across records...",
  onRefresh,
  enableExport = true,
  exportFileName = "campushub-export.csv",
  onRowSelected,
  getRowId,
  paginationPageSize = 10,
  height = 480,
  extraToolbarActions,
  onGridReady: onGridReadyProp,
}: CampusGridProps<T>) {
  const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);

  const defaultColDef = useMemo<ColDef<T>>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
    };
  }, []);

  const handleGridReady = useCallback(
    (params: GridReadyEvent<T>) => {
      setGridApi(params.api);
      if (onGridReadyProp) {
        onGridReadyProp(params);
      }
    },
    [onGridReadyProp]
  );

  const handleQuickFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickFilterText(val);
    if (gridApi) {
      gridApi.setGridOption("quickFilterText", val);
    }
  };

  const handleClearSearch = () => {
    setQuickFilterText("");
    if (gridApi) {
      gridApi.setGridOption("quickFilterText", "");
    }
  };

  const handleExportCsv = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: exportFileName,
      });
    }
  };

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<T>) => {
      const selected = event.api.getSelectedRows();
      setSelectedCount(selected.length);
      if (onRowSelected) {
        onRowSelected(selected.length > 0 ? selected[0] : null);
      }
    },
    [onRowSelected]
  );

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {title && (
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold font-headline text-on-surface">
                {title}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono font-bold text-xs">
                {rowData.length} {rowData.length === 1 ? "record" : "records"}
              </span>
              {selectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs">
                  {selectedCount} selected
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Search, Export and Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <span className="material-symbols-outlined text-sm text-outline absolute left-3 top-2.5 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={quickFilterText}
              onChange={handleQuickFilterChange}
              placeholder={quickSearchPlaceholder}
              className="pl-8 pr-7 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary w-full sm:w-60"
            />
            {quickFilterText && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2 text-outline hover:text-on-surface"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Export CSV Button */}
          {enableExport && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:bg-surface-container text-on-surface font-headline font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Export visible community dataset to CSV"
            >
              <span className="material-symbols-outlined text-sm text-primary">download</span>
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:bg-surface-container text-on-surface transition-colors shadow-2xs cursor-pointer"
              title="Refresh data"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
          )}

          {extraToolbarActions}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="underline font-bold hover:text-red-800"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Grid Container */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant/25">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-on-surface-variant font-mono">
              Loading grid records...
            </span>
          </div>
        )}

        <div style={{ height, width: "100%" }} className="w-full">
          <AgGridReact<T>
            theme={campushubGridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowSelection={{ mode: "singleRow", checkboxes: false, enableClickSelection: true }}
            onSelectionChanged={handleSelectionChanged}
            onGridReady={handleGridReady}
            getRowId={getRowId}
            animateRows={true}
            domLayout="normal"
            overlayNoRowsTemplate="<span style='color: #75796a; font-size: 13px; font-weight: 500;'>No records found matching your filters.</span>"
          />
        </div>
      </div>
    </div>
  );
}
