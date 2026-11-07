"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";

export type RegistrationActionResult = { ok?: string; error?: string } | null;

const statusSchema = z.enum(["confirmed", "checked_in", "cancelled"]);
const idSchema = z.string().uuid();

/**
 * Update a registration's status via the RLS-scoped client.
 * Checking in (`checked_in`) also stamps `checkin_at` with the current time.
 */
export async function updateRegistrationStatus(
  id: string,
  status: "confirmed" | "checked_in" | "cancelled",
): Promise<RegistrationActionResult> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid registration id" };

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const update: {
    status: "confirmed" | "checked_in" | "cancelled";
    checkin_at?: string;
  } = {
    status: parsed.data,
  };
  if (parsed.data === "checked_in") {
    update.checkin_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("registrations")
    .update(update)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/registrations");
  revalidatePath("/dashboard");
  return {
    ok:
      parsed.data === "checked_in"
        ? "Attendee checked in."
        : `Registration ${parsed.data.replace("_", " ")}.`,
  };
}
