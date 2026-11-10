import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell, type ShellNotification } from "@/components/layout/app-shell";
import type { CurrencyCode } from "@/components/ui/currency-context";
import { dashboardNav } from "@/lib/nav";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, notifications, isMasterShowcaseOrg } from "@/lib/db/repo";
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
    return <SetupNotice what="the dashboard" />;
  }

  const session = await getSessionContext();
  if (!session) redirect("/login");
  const cookieStore = await cookies();
  const initialCurrency =
    (cookieStore.get("ch-currency")?.value as CurrencyCode) ?? "MYR";
  const [orgList, unreadCount, recentNotifs] = await Promise.all([
    orgs.list(session.orgIds),
    notifications.countUnread(session.orgIds),
    notifications.list(session.orgIds, 8),
  ]);

  if (orgList.length === 0) {
    redirect("/login");
  }

  const activeOrgId = cookieStore.get("ch-active-org")?.value;
  const activeOrg = orgList.find((o) => o.id === activeOrgId) ?? orgList[0];
  const isReadOnly = isMasterShowcaseOrg(activeOrg.id);
  const orgsList = orgList.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    isReadOnly: isMasterShowcaseOrg(o.id),
  }));

  const initials = (session.user.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const shellNotifications: ShellNotification[] = recentNotifs.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read_at: n.read_at,
    created_at: n.created_at,
  }));

  return (
    <AppShell
      orgName={activeOrg.name}
      userInitials={initials}
      userEmail={session.user.email ?? "owner@campushub.test"}
      userName={session.user.name ?? "Campus Organizer"}
      unreadCount={unreadCount}
      notifications={shellNotifications}
      nav={dashboardNav}
      initialCurrency={initialCurrency}
      isReadOnly={isReadOnly}
      orgsList={orgsList}
    >
      {children}
    </AppShell>
  );
}
