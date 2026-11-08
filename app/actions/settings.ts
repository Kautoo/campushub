"use server";

import { revalidatePath } from "next/cache";
import { orgSettingsSchema } from "@/lib/validation";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { orgs } from "@/lib/db/repo";

export type SettingsState = { ok?: string; error?: string } | null;

export async function updateOrgSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsed = orgSettingsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const org = await orgs.firstForUser(session.user.id);
  if (!org) return { error: "No organization found for your account." };

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  settings.gateways = {
    ...(settings.gateways as Record<string, unknown> | undefined),
    paypal: formData.get("paypal_gateway") === "on",
  };

  const updated = await orgs.update(org.id, session.orgIds, {
    name: parsed.data.name,
    description: parsed.data.description || null,
    currency: parsed.data.currency,
    settings,
  });

  if (!updated) return { error: "Could not save the organization settings." };
  revalidatePath("/dashboard/settings");
  return { ok: "Organization settings saved." };
}
