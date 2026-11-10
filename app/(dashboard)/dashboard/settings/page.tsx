import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { UserProfileForm } from "@/components/settings/user-profile-form";
import { MembersGrid } from "@/components/settings/members-grid";
import { Badge } from "@/components/ui/badge";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, orgMembers, users } from "@/lib/db/repo";

export const metadata = { title: "Settings — CampusHub" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="settings" />;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const sParams = await searchParams;
  const activeTab = sParams?.tab === "account" ? "account" : "organization";
  const [orgList, members, currentUser] = await Promise.all([
    orgs.list(session.orgIds),
    orgMembers.listByOrgs(session.orgIds),
    users.getById(session.user.id),
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
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/45 pb-1">
        <Link
          href="/dashboard/settings?tab=organization"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
            activeTab === "organization"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">domain</span>
          <span>Organization &amp; Gateways</span>
        </Link>

        <Link
          href="/dashboard/settings?tab=account"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
            activeTab === "account"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          <span>Personal Account Profile</span>
        </Link>
      </div>

      {activeTab === "account" ? (
        <div className="space-y-6">
          <SectionHeader
            icon="person"
            eyebrow="Personal Identity & Security"
            title="Personal Account Profile Settings"
            subtitle="Customize your display name, choose an avatar icon, and view personal account credentials."
            actions={
              <Badge tone="teal" icon="verified_user">
                Active Session
              </Badge>
            }
          />
          <UserProfileForm
            user={{
              id: session.user.id,
              name: currentUser?.name ?? session.user.name,
              email: session.user.email ?? "member@campus.edu",
              image: currentUser?.image,
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <SectionHeader
            icon="settings"
            eyebrow="Workspace Governance"
            title="Organization Profile & Gateway Settings"
            subtitle="Configure your campus society's public identity, settlement currency, PayPal Orders v2 checkout integration, and executive committee permissions."
            actions={
              <Badge tone="teal" icon="verified">
                Org ID: {org.slug}
              </Badge>
            }
          />
          <OrgSettingsForm org={org} />

          <section className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-4">
              <div>
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Access Control Roster
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface mt-0.5">
                  Authorized Organization Members
                </h3>
              </div>
              <Badge tone="primary">{memberRows.length} members</Badge>
            </div>
            <MembersGrid rows={memberRows} canManage />
          </section>
        </div>
      )}
    </div>
  );
}
