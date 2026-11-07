import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { dashboardNav } from "@/lib/nav";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";
import { SetupNotice } from "@/components/layout/setup-notice";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) {
    return <SetupNotice what="the dashboard" />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [orgsRes, unreadRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, currency")
      .order("created_at", { ascending: true })
      .limit(10),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
  ]);

  const orgs = orgsRes.data ?? [];
  if (orgs.length === 0) {
    return (
      <SetupNotice
        what="an organization"
        hint="No organization is linked to your account. If you registered before the demo seed was applied, run select public.join_demo_org(); in the Supabase SQL editor."
      />
    );
  }

  const initials = (user.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell
      orgName={orgs[0].name}
      orgs={orgs.map((o) => ({ id: o.id, name: o.name }))}
      userInitials={initials}
      unreadCount={unreadRes.count ?? 0}
      nav={dashboardNav}
    >
      {children}
    </AppShell>
  );
}
