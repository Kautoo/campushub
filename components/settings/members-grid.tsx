"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { DataTable } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";

export type MemberRow = {
  id: string;
  full_name: string;
  role: string;
  status: string;
  joined: string;
};

/** Members list grid (AG Grid Community). Invites land in Phase 6 members workspace. */
export function MembersGrid({
  rows,
  canManage,
  renderActions,
}: {
  rows: MemberRow[];
  canManage?: boolean;
  /** Optional per-row actions column (members workspace role change/remove). */
  renderActions?: (row: MemberRow) => React.ReactNode;
}) {
  const columnDefs = useMemo<ColDef<MemberRow>[]>(
    () => [
      { field: "full_name", headerName: "Member", minWidth: 180 },
      {
        field: "role",
        headerName: "Role",
        maxWidth: 140,
        cellRenderer: (p: { value: string }) => {
          const tone =
            p.value === "owner" ? "primary" : p.value === "admin" ? "teal" : "neutral";
          return <Badge tone={tone}>{p.value}</Badge>;
        },
      },
      {
        field: "status",
        headerName: "Status",
        maxWidth: 140,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={p.value === "active" ? "success" : "warning"}>
            {p.value}
          </Badge>
        ),
      },
      {
        field: "joined",
        headerName: "Joined",
        maxWidth: 160,
        valueFormatter: (p) => new Date(p.value).toLocaleDateString("en-MY"),
      },
      ...(canManage
        ? [
            {
              headerName: "",
              sortable: false,
              filter: false,
              maxWidth: renderActions ? 200 : 120,
              cellRenderer: renderActions
                ? (p: { data?: MemberRow }) =>
                    p.data ? renderActions(p.data) : null
                : undefined,
            } satisfies ColDef<MemberRow>,
          ]
        : []),
    ],
    [canManage, renderActions],
  );

  return <DataTable columnDefs={columnDefs} rowData={rows} height={320} />;
}
