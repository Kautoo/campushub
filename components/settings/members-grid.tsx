"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { DataTable, type DataTableFilterPill } from "@/components/grid/data-table";
import { Badge } from "@/components/ui/badge";
import { MemberRowActions } from "@/components/workspaces/member-row-actions";

export type MemberRow = {
  id: string;
  full_name: string;
  role: string;
  status: string;
  joined: string;
};

const MEMBER_FILTER_PILLS: DataTableFilterPill[] = [
  { value: "all", label: "All Members" },
  { value: "owner", label: "Owners" },
  { value: "admin", label: "Admins" },
  { value: "staff", label: "Staff" },
];

/** Members list grid (AG Grid Community) aligned with CampusHub 2.0 DESIGN.md. */
export function MembersGrid({
  rows,
  canManage,
}: {
  rows: MemberRow[];
  canManage?: boolean;
}) {
  const columnDefs = useMemo<ColDef<MemberRow>[]>(
    () => [
      {
        field: "full_name",
        headerName: "Committee Member",
        minWidth: 220,
        flex: 1.6,
        cellRenderer: (p: { data?: MemberRow }) => {
          if (!p.data) return null;
          const initials = p.data.full_name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3 min-w-0 py-1">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-label-sm font-bold shrink-0">
                {initials || "MB"}
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {p.data.full_name}
                </p>
                <p className="text-[11px] font-mono text-on-surface-variant truncate">
                  ID: {p.data.id.slice(0, 8)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        field: "role",
        headerName: "Access Role",
        maxWidth: 150,
        cellRenderer: (p: { value: string }) => {
          const tone =
            p.value === "owner"
              ? "primary"
              : p.value === "admin"
                ? "teal"
                : "neutral";
          return (
            <Badge
              tone={tone}
              icon={
                p.value === "owner"
                  ? "shield_person"
                  : p.value === "admin"
                    ? "verified_user"
                    : "badge"
              }
            >
              {p.value}
            </Badge>
          );
        },
      },
      {
        field: "status",
        headerName: "Membership Status",
        maxWidth: 160,
        cellRenderer: (p: { value: string }) => (
          <Badge tone={p.value === "active" ? "success" : "warning"}>
            {p.value}
          </Badge>
        ),
      },
      {
        field: "joined",
        headerName: "Joined Date",
        maxWidth: 165,
        valueFormatter: (p) =>
          new Date(p.value).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      ...(canManage
        ? [
            {
              headerName: "Permissions",
              sortable: false,
              filter: false,
              resizable: false,
              minWidth: 210,
              maxWidth: 230,
              cellRenderer: (p: { data?: MemberRow }) =>
                p.data ? <MemberRowActions row={p.data} /> : null,
            } satisfies ColDef<MemberRow>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <DataTable
      columnDefs={columnDefs}
      rowData={rows}
      height={380}
      searchPlaceholder="Search committee members by name or role…"
      filterField="role"
      filterPills={MEMBER_FILTER_PILLS}
      exportFileName="campushub-members.csv"
    />
  );
}
