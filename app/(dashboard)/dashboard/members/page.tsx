import { redirect } from "next/navigation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { MembersGrid, type MemberRow } from "@/components/settings/members-grid";
import { MemberInvite } from "@/components/workspaces/member-invite";
import { MemberRowActions } from "@/components/workspaces/member-row-actions";

export const metadata = { title: "Members — CampusHub 2.0" };
export default async function MembersPage() {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return <SetupNotice what="members" />;

  const [{ data: { user } }, [orgsRes, membersRes]] = await Promise.all([
    supabase.auth.getUser(),
    Promise.all([
      supabase.from("organizations").select("id, name").limit(1),
      supabase
        .from("org_members")
        .select("org_id, user_id, role, status, created_at")
        .order("created_at", { ascending: true }),
    ]),
  ]);
  if (!user) redirect("/login");

  // Depends on the resolved user id, so it runs after the parallel batch.
  const meRes = await supabase
    .from("org_members")
    .select("role")
    .eq("user_id", user.id)
    .limit(1);

  const org = orgsRes.data?.[0];
  if (!org) return <SetupNotice what="an organization" />;

  const members = (membersRes.data ?? []).filter((m) => m.org_id === org.id);
  const myRole = meRes.data?.[0]?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  const userIds = members.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const memberRows: MemberRow[] = members.map((m) => ({
    id: m.user_id,
    full_name: profileMap.get(m.user_id)?.full_name ?? "—",
    role: m.role,
    status: m.status,
    joined: m.created_at,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="group"
        title="Members"
        subtitle={`People in ${org.name}`}
        actions={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-label-md font-semibold text-white dark:bg-primary/15 dark:text-primary">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {memberRows.length}
          </span>
        }
      />

      {canManage ? (
        <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
          <h3 className="text-headline-sm text-ink mb-3">Invite a member</h3>
          <MemberInvite />
          <p className="text-body-sm text-muted mt-3">
            The invitee receives a Supabase sign-up email and joins with the
            selected role and status “invited” until they accept.
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
          <div className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
            <MembersGrid
              rows={memberRows}
              canManage={canManage}
              renderActions={(row) => <MemberRowActions row={row} />}
            />
          </div>
        )}
      </section>
    </div>
  );
}
