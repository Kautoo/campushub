import { redirect } from "next/navigation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader } from "@/components/ui/primitives";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { MembersGrid } from "@/components/settings/members-grid";

export const metadata = { title: "Settings — CampusHub 2.0" };

export default async function SettingsPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="settings" />;

  const [{ data: { user } }, [orgsRes, membersRes]] = await Promise.all([
    supabase.auth.getUser(),
    Promise.all([
      supabase.from("organizations").select("*").limit(1),
      supabase
        .from("org_members")
        .select("org_id, user_id, role, status, created_at"),
    ]),
  ]);
  if (!user) redirect("/login");

  const org = orgsRes.data?.[0];
  if (!org) return <SetupNotice what="an organization" />;

  const members = membersRes.data ?? [];
  const userIds = members.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const memberRows = members.map((m) => ({
    id: m.user_id,
    full_name: profileMap.get(m.user_id)?.full_name ?? "—",
    role: m.role,
    status: m.status,
    joined: m.created_at,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="settings"
        title="Settings"
        subtitle="Organization profile, members, and gateways"
      />
      <OrgSettingsForm org={org} />
      <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
        <MembersGrid rows={memberRows} canManage />
      </section>
    </div>
  );
}
