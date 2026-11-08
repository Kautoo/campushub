"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { DataTable } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { MemberRowActions } from "@/components/workspaces/member-row-actions";

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
}: {
  rows: MemberRow[];
  canManage?: boolean;
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
              maxWidth: 200,
              cellRenderer: (p: { data?: MemberRow }) =>
                p.data ? <MemberRowActions row={p.data} /> : null,
            } satisfies ColDef<MemberRow>,
          ]
        : []),
    ],
    [canManage],
  );

  return <DataTable columnDefs={columnDefs} rowData={rows} height={320} />;
}
