"use server";

import { revalidatePath } from "next/cache";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { notifications } from "@/lib/db/repo";

/**
 * Mark one notification read (read_at = now). Org-scoped via the repo layer:
 * only notifications in the caller's orgs are updated.
 * Returns void so it can be used directly as a <form action>.
 */
export async function markNotificationRead(
  id: string,
): Promise<void> {
  if (!hasDatabaseEnv()) return;
  const session = await getSessionContext();
  if (!session) return;

  await notifications.markRead(id, session.orgIds);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
}

/** Mark every unread notification for the user's orgs read. */
export async function markAllNotificationsRead(): Promise<void> {
  if (!hasDatabaseEnv()) return;
  const session = await getSessionContext();
  if (!session) return;

  await notifications.markAllRead(session.orgIds);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
}
