import { auth } from "@/auth";
import { orgs, users } from "@/lib/db/repo";
import { hasDatabaseEnv } from "@/lib/db";
import { cookies } from "next/headers";

export type SessionContext = {
  user: { id: string; email?: string | null; name?: string | null };
  orgIds: string[];
  activeOrgId: string;
};

/**
 * Resolve the signed-in user and their org memberships once per request.
 * Returns null when unauthenticated (or DB unconfigured) — callers map that
 * to the setup-notice / 401 contract the Supabase path had.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !hasDatabaseEnv()) return null;

  let orgIds = await orgs.listIdsByUser(user.id);
  let resolvedUser = { id: user.id, email: user.email, name: user.name };

  // If user has no orgs (e.g. database was wiped/reseeded while JWT cookie remained),
  // recover by email if account exists in the fresh database:
  if (orgIds.length === 0 && user.email) {
    const dbUser = await users.getByEmail(user.email);
    if (dbUser) {
      orgIds = await orgs.listIdsByUser(dbUser.id);
      resolvedUser = { id: dbUser.id, email: dbUser.email, name: dbUser.name };
    }
  }

  // If user has no organizations linked in this database, treat session as expired
  // so protected routes redirect to /login rather than showing setup-notice.
  if (orgIds.length === 0) {
    return null;
  }

  let activeOrgId = orgIds[0];
  try {
    const cookieStore = await cookies();
    const cookieActive = cookieStore.get("ch-active-org")?.value;
    if (cookieActive && orgIds.includes(cookieActive)) {
      activeOrgId = cookieActive;
    }
  } catch {}

  return { user: resolvedUser, orgIds, activeOrgId };
}
