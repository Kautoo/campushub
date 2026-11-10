"use server";

import { revalidatePath } from "next/cache";
import { orgSettingsSchema } from "@/lib/validation";
import { hasDatabaseEnv, getPool } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, orgMembers, users, isMasterShowcaseOrg } from "@/lib/db/repo";

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

  const org = await orgs.firstForUser(session.user.id, session.activeOrgId);
  if (!org) return { error: "No organization found for your account." };

  if (isMasterShowcaseOrg(org.id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to customize organization settings.",
    };
  }

  const myMemberships = await orgMembers.listByUser(session.user.id);
  const me = myMemberships.find((m) => m.org_id === org.id);
  if (!me || (me.role !== "owner" && me.role !== "admin")) {
    return { error: "Only admins and owners can update organization settings." };
  }
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
export async function updateUserProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };
  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };
  const name = String(formData.get("name") || "").trim().slice(0, 100);
  const rawImage = String(formData.get("image") || "").trim().slice(0, 1000);

  if (!name) return { error: "Name cannot be empty." };

  const updated = await users.updateProfile(session.user.id, {
    name,
    image: rawImage || null,
  });

  if (!updated) return { error: "Failed to update profile." };

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/settings");
  return { ok: "Personal profile updated successfully." };
}

/** Restore demo organization events and merchandise to active status */
export async function resetDemoCatalog(): Promise<SettingsState> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };
  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const org = await orgs.firstForUser(session.user.id, session.activeOrgId);
  if (!org) return { error: "No organization found." };

  if (isMasterShowcaseOrg(org.id)) {
    return {
      error: "The master showcase workspace is read-only. Switch or launch your private sandbox to reset catalog data.",
    };
  }
  const pool = getPool();
  await pool.query(
    `update public.products set status = 'active', stock = case when stock <= 0 then 45 else stock end where org_id = $1::uuid`,
    [org.id],
  );
  await pool.query(
    `update public.events set status = 'published' where org_id = $1::uuid and status = 'draft'`,
    [org.id],
  );

  revalidatePath("/demo", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: "Demo catalog refreshed: all products and events reset to active status." };
}
