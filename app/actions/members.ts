"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { hasDatabaseEnv, withTransaction } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { orgs, orgMembers } from "@/lib/db/repo";
import { randomBytes } from "node:crypto";

export type MemberActionResult = { ok?: string; error?: string } | null;

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["owner", "admin", "staff"], {
    message: "Choose a role",
  }),
});

const roleSchema = z.enum(["owner", "admin", "staff"], {
  message: "Choose a role",
});

/**
 * Invite a user by email: create (or reuse) the user row with a random
 * password + `invited` membership in the organizer's first org, and return a
 * registration link the invitee uses to set their own password. Auth.js has
 * no admin invite API, so the invite is a DB record + link.
 */
export async function inviteMember(
  _prev: MemberActionResult,
  formData: FormData,
): Promise<MemberActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const org = await orgs.firstForUser(session.user.id);
  if (!org) return { error: "No organization found for your account." };

  const email = parsed.data.email.toLowerCase();

  try {
    await withTransaction(async (client) => {
      // Reuse the existing account when the email is already registered.
      const { rows: existing } = await client.query<{ id: string }>(
        `select id from public.users where lower(email) = lower($1) limit 1`,
        [email],
      );
      let userId = existing[0]?.id;
      if (!userId) {
        // Random password the invitee never sees — they set their own via the
        // registration link; the placeholder hash keeps the account unusable
        // until then.
        const placeholder = await hashPassword(randomBytes(24).toString("hex"));
        const { rows } = await client.query<{ id: string }>(
          `insert into public.users (name, email, password_hash)
           values ($1, $2, $3) returning id`,
          [email.split("@")[0], email, placeholder],
        );
        userId = rows[0].id;
      }
      await client.query(
        `insert into public.org_members (org_id, user_id, role, status)
         values ($1::uuid, $2::uuid, $3, 'invited')
         on conflict (org_id, user_id) do update
           set role = excluded.role, status = 'invited'`,
        [org.id, userId, parsed.data.role],
      );
    });
  } catch (err) {
    return { error: (err as Error).message ?? "Invite failed." };
  }

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/settings");
  return {
    ok: `Invited ${email} as ${parsed.data.role}. Share the register link (/register?email=${encodeURIComponent(email)}) so they can set a password.`,
  };
}

/** Change a member's role. Repo restricts writes to the caller's orgs. */
export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<MemberActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const parsedRole = roleSchema.safeParse(role);
  if (!parsedRole.success) return { error: "Choose a role" };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const org = await orgs.firstForUser(session.user.id);
  if (!org) return { error: "No organization found for your account." };

  const updated = await orgMembers.updateRole(org.id, session.orgIds, userId, parsedRole.data);
  if (!updated) return { error: "Member not found in your organization." };

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/settings");
  return { ok: "Role updated." };
}

/** Remove a member from the org. Repo restricts deletes to the caller's orgs. */
export async function removeMember(
  userId: string,
): Promise<MemberActionResult> {
  if (!hasDatabaseEnv()) return { error: "Database is not configured." };

  const session = await getSessionContext();
  if (!session) return { error: "You must be signed in." };

  const org = await orgs.firstForUser(session.user.id);
  if (!org) return { error: "No organization found for your account." };

  const removed = await orgMembers.delete(org.id, session.orgIds, userId);
  if (!removed) return { error: "Member not found in your organization." };

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/settings");
  return { ok: "Member removed." };
}
