import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { dashboardNav } from "@/lib/nav";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, notifications } from "@/lib/db/repo";
import { SetupNotice } from "@/components/layout/setup-notice";

// Session reads (auth() → cookies) block on the server for this segment —
// the whole dashboard is user-specific, so there is no meaningful static shell.
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = getDbSafe();
  if (!db) {
    // Database unconfigured: render the setup notice instead of redirecting
    // to /login (the proxy would bounce back here without a session).
    return <SetupNotice what="the dashboard" />;
  }

  const session = await getSessionContext();
  if (!session) redirect("/login");
  const [orgList, unreadCount] = await Promise.all([
    orgs.list(session.orgIds),
    notifications.countUnread(session.orgIds),
  ]);

  if (orgList.length === 0) {
    return (
      <SetupNotice
        what="an organization"
        hint="No organization is linked to your account. Register a new account to get your own workspace, or sign in with the seeded demo credentials from the README."
      />
    );
  }

  const initials = (session.user.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell
      orgName={orgList[0].name}
      orgs={orgList.map((o) => ({ id: o.id, name: o.name }))}
      userInitials={initials}
      unreadCount={unreadCount}
      nav={dashboardNav}
    >
      {children}
    </AppShell>
  );
}
