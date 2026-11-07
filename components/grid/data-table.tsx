"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridOptions,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

/** Stitch-themed AG Grid: navy header, teal selection, rounded frame. */
const stitchTheme = themeQuartz.withParams({
    accentColor: "var(--st-primary)",
    borderColor: "var(--st-outline-variant)",
    wrapperBorder: true,
    wrapperBorderRadius: 12,
    browserColorScheme: "inherit",
    headerBackgroundColor: "var(--st-primary-container)",
    headerTextColor: "#ffffff",
    headerFontSize: 12,
    headerFontWeight: 600,
    oddRowBackgroundColor: "var(--st-surface-low)",
    rowHoverColor: "var(--st-surface-container)",
    selectedRowBackgroundColor: "color-mix(in srgb, var(--st-primary) 12%, transparent)",
    fontFamily: "inherit",
    fontSize: 13,
    rowBorder: true,
  });

export function DataTable<T extends { id?: string }>({
  columnDefs,
  rowData,
  gridOptions,
  height = 420,
  className,
}: {
  columnDefs: ColDef<T>[];
  rowData: T[];
  gridOptions?: GridOptions<T>;
  height?: number;
  className?: string;
}) {
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    }),
    [],
  );

  return (
    <div
      className={className}
      style={{ height, width: "100%" }}
    >
      <AgGridReact
        theme={stitchTheme}
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        getRowId={(p) => String(p.data?.id ?? "")}
        pagination
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50]}
        animateRows
        suppressCellFocus
        {...gridOptions}
      />
    </div>
  );
}
