import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { MembersGrid } from "@/components/settings/members-grid";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, orgMembers, users } from "@/lib/db/repo";

export const metadata = { title: "Settings — CampusHub 2.0" };

export default async function SettingsPage() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="settings" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const [orgList, members] = await Promise.all([
    orgs.list(session.orgIds),
    orgMembers.listByOrgs(session.orgIds),
  ]);

  const org = orgList[0];
  if (!org) return <SetupNotice what="an organization" />;

  const userIds = members.map((m) => m.user_id);
  const profiles = await users.listByIds(userIds);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const memberRows = members.map((m) => ({
    id: m.user_id,
    full_name: profileMap.get(m.user_id)?.name ?? "—",
    role: m.role,
    status: m.status,
    joined: m.created_at,
  }));

  return (
    <div className="space-y-space-lg">
      <SectionHeader
        icon="settings"
        title="Organization Profile & Settings"
        subtitle="Manage your campus organization's public identity, member permissions, transaction notification channels, and institutional security controls."
      />
      <OrgSettingsForm org={org} />
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <MembersGrid rows={memberRows} canManage />
      </section>
    </div>
  );
}
