"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";

/**
 * Mark one notification read (read_at = now). RLS-scoped server client:
 * org members may update notifications in their org.
 * Returns void so it can be used directly as a <form action>.
 */
export async function markNotificationRead(
  id: string,
): Promise<void> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/dashboard/notifications");
}

/** Mark every unread notification for the user's org read. */
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);

  revalidatePath("/dashboard/notifications");
}
