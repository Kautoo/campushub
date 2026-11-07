"use server";

import { revalidatePath } from "next/cache";
import { orgSettingsSchema } from "@/lib/validation";
import { getSupabaseServerSafe } from "@/lib/supabase/safe";

export type SettingsState = { ok?: string; error?: string } | null;

export async function updateOrgSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsed = orgSettingsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, settings")
    .limit(1);
  const org = orgs?.[0];
  if (!org) return { error: "No organization found for your account." };

  const settings = (org.settings ?? {}) as Record<string, unknown>;
  settings.gateways = {
    ...(settings.gateways as Record<string, unknown> | undefined),
    paypal: formData.get("paypal_gateway") === "on",
  };

  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      currency: parsed.data.currency,
      settings,
    })
    .eq("id", org.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: "Organization settings saved." };
}
