import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { MembersGrid, type MemberRow } from "@/components/settings/members-grid";
import { MemberInvite } from "@/components/workspaces/member-invite";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, orgMembers, users } from "@/lib/db/repo";

export const metadata = { title: "Members — CampusHub 2.0" };
export default async function MembersPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="members" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const [orgList, members] = await Promise.all([
    orgs.list(session.orgIds),
    orgMembers.listByOrgs(session.orgIds),
  ]);

  // Depends on the resolved user id, so it runs after the parallel batch.
  const me = await orgMembers.listByUser(session.user.id);

  const org = orgList[0];
  if (!org) return <SetupNotice what="an organization" />;

  const orgMembersRows = members.filter((m) => m.org_id === org.id);
  const myRole = me[0]?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const userIds = orgMembersRows.map((m) => m.user_id);
  const profiles = await users.listByIds(userIds);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const memberRows: MemberRow[] = orgMembersRows.map((m) => ({
    id: m.user_id,
    full_name: profileMap.get(m.user_id)?.name ?? "—",
    role: m.role,
    status: m.status,
    joined: m.created_at,
  }));

  return (
    <div className="space-y-space-lg">
      <SectionHeader
        icon="groups"
        title="Members Management"
        subtitle="Manage your executive committee, role permissions, and contributor credentials"
        actions={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-label-md font-semibold text-white dark:bg-primary/15 dark:text-primary">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {memberRows.length}
          </span>
        }
      />

      {canManage ? (
        <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Invite a member</h3>
          <MemberInvite />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
            The invitee gets a member record with status “invited” — share the
            registration link so they can set a password and join with the
            selected role.
          </p>
        </section>
      ) : null}

      <section>
        {memberRows.length === 0 ? (
          <EmptyState
            icon="group_off"
            title="No members yet"
            body="Invite your first teammate to start collaborating."
          />
        ) : (
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <MembersGrid rows={memberRows} canManage={canManage} />
          </div>
        )}
      </section>
    </div>
  );
}
