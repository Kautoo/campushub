import { auth } from "@/auth";
import { orgs } from "@/lib/db/repo";
import { hasDatabaseEnv } from "@/lib/db";

export type SessionContext = {
  user: { id: string; email?: string | null; name?: string | null };
  orgIds: string[];
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
  const orgIds = await orgs.listIdsByUser(user.id);
  return { user: { id: user.id, email: user.email, name: user.name }, orgIds };
}
