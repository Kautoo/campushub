"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { registrations, isMasterShowcaseOrg } from "@/lib/db/repo";

export type RegistrationActionResult = { ok?: string; error?: string } | null;

const statusSchema = z.enum(["confirmed", "checked_in", "cancelled"]);
const idSchema = z.string().uuid();

/**
 * Update a registration's status (org-scoped via the repo layer).
 * Checking in (`checked_in`) also stamps `checkin_at` with the current time.
 */
export async function updateRegistrationStatus(
  id: string,
  status: "confirmed" | "checked_in" | "cancelled",
): Promise<RegistrationActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid registration id" };

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };
  const regList = await registrations.listWithJoins(session.orgIds, 1000);
  const target = regList.find((r) => r.id === parsedId.data);
  if (target && isMasterShowcaseOrg(target.org_id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to update registrations.",
    };
  }

  const updated = await registrations.updateStatus(parsedId.data, session.orgIds, {
    status: parsed.data,
    checkin_at:
      parsed.data === "checked_in" ? new Date().toISOString() : undefined,
  });

  if (!updated) return { error: "Registration not found." };
  revalidatePath("/dashboard/registrations");
  revalidatePath("/dashboard");
  return {
    ok:
      parsed.data === "checked_in"
        ? "Attendee checked in."
        : `Registration ${parsed.data.replace("_", " ")}.`,
  };
}
