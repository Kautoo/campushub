export type OrgRole = "owner" | "admin" | "staff";

export const ROLE_RANK: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  staff: 1,
};

/** staff < admin < owner */
export function hasRole(userRole: OrgRole, required: OrgRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

export function canManageMembers(role: OrgRole): boolean {
  return hasRole(role, "admin");
}

export function canEditContent(role: OrgRole): boolean {
  return hasRole(role, "staff");
}

export function canDeleteOrgData(role: OrgRole): boolean {
  return hasRole(role, "admin");
}

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
};
