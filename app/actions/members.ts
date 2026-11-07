"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerSafe, getSupabaseAdminSafe } from "@/lib/supabase/safe";

export type MemberActionResult = { ok?: string; error?: string } | null;

export type ServerSupabase = NonNullable<
  Awaited<ReturnType<typeof getSupabaseServerSafe>>
>;

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["owner", "admin", "staff"], {
    message: "Choose a role",
  }),
});

const roleSchema = z.enum(["owner", "admin", "staff"], {
  message: "Choose a role",
});

/** First org for the signed-in user (org_members row 1). */
async function firstOrg(supabase: ServerSupabase) {
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .limit(1);
  return orgs?.[0] ?? null;
}

/**
 * Invite a user by email (service role required — auth admin API bypasses RLS),
 * then add them to the organizer's first org with the chosen role, status 'invited'.
 */
export async function inviteMember(
  _prev: MemberActionResult,
  formData: FormData,
): Promise<MemberActionResult> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const org = await firstOrg(supabase);
  if (!org) return { error: "No organization found for your account." };

  const admin = getSupabaseAdminSafe();
  if (!admin) return { error: "service_role_missing" };

  const email = parsed.data.email.toLowerCase();

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError) {
    // Supabase rejects invites for already-registered emails; that is still an
    // add-to-org flow, so fall through to the membership upsert instead of
    // failing outright.
    if (!/already|registered|exist/i.test(inviteError.message)) {
      return { error: inviteError.message };
    }
  }

  // Resolve the invited user's id (freshly invited or existing account).
  const { data: users } = await admin.auth.admin.listUsers({ page: 1 });
  const userId = users?.users?.find(
    (u) => u.email?.toLowerCase() === email,
  )?.id;
  if (!userId) return { error: "Invited user could not be resolved." };

  const { error: memberError } = await admin.from("org_members").upsert(
    {
      org_id: org.id,
      user_id: userId,
      role: parsed.data.role,
      status: "invited",
    },
    { onConflict: "org_id,user_id" },
  );
  if (memberError) return { error: memberError.message };

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/settings");
  return { ok: `Invitation sent to ${email}.` };
}

/** Change a member's role. RLS restricts writes to org admins/owners. */
export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<MemberActionResult> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const parsedRole = roleSchema.safeParse(role);
  if (!parsedRole.success) return { error: "Choose a role" };

  const org = await firstOrg(supabase);
  if (!org) return { error: "No organization found for your account." };

  const { error } = await supabase
    .from("org_members")
    .update({ role: parsedRole.data })
    .eq("org_id", org.id)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/settings");
  return { ok: "Role updated." };
}

/** Remove a member from the org. RLS restricts deletes to org admins/owners. */
export async function removeMember(
  userId: string,
): Promise<MemberActionResult> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return { error: "Supabase is not configured." };

  const org = await firstOrg(supabase);
  if (!org) return { error: "No organization found for your account." };

  const { error } = await supabase
    .from("org_members")
    .delete()
    .eq("org_id", org.id)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/settings");
  return { ok: "Member removed." };
}
