import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { StatStrip } from "@/components/ui/kpi-card";
import { MembersGrid, type MemberRow } from "@/components/settings/members-grid";
import { MemberInvite } from "@/components/workspaces/member-invite";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, orgMembers, users } from "@/lib/db/repo";

export const metadata = { title: "Committee Members — CampusHub" };

export default async function MembersPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="members" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const [orgList, members] = await Promise.all([
    orgs.list(session.orgIds),
    orgMembers.listByOrgs(session.orgIds),
  ]);

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

  const ownersCount = memberRows.filter((m) => m.role === "owner").length;
  const adminsCount = memberRows.filter((m) => m.role === "admin").length;
  const staffCount = memberRows.filter((m) => m.role === "staff").length;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="groups"
        eyebrow="Identity & Role-Based Access Control"
        title="Committee & Team Permissions"
        subtitle="Manage your society executive committee, assign Owner / Admin / Staff privileges, and onboard student volunteers."
      />

      <StatStrip
        items={[
          {
            label: "Total Committee",
            value: memberRows.length,
            icon: "groups",
            tone: "primary",
            sublabel: `Active in ${org.name}`,
          },
          {
            label: "Society Owners",
            value: ownersCount,
            icon: "shield_person",
            tone: "teal",
            sublabel: "Full financial & org control",
          },
          {
            label: "Administrators",
            value: adminsCount,
            icon: "verified_user",
            tone: "success",
            sublabel: "Event, SKU & member access",
          },
          {
            label: "Operations Staff",
            value: staffCount,
            icon: "badge",
            tone: "neutral",
            sublabel: "Gate check-in & catalog ops",
          },
        ]}
      />

      {canManage ? (
        <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
          <div className="mb-4">
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
              Committee Onboarding
            </span>
            <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
              Invite a Society Member
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Creates a pre-authorized member record with status “invited” — share the registration link so they can set a password and join with the assigned role.
            </p>
          </div>
          <MemberInvite />
        </section>
      ) : null}

      <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs">
        {memberRows.length === 0 ? (
          <EmptyState
            icon="group_off"
            title="No members yet"
            body="Invite your first teammate to start collaborating."
          />
        ) : (
          <MembersGrid rows={memberRows} canManage={canManage} />
        )}
      </section>
    </div>
  );
}
