"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn as authSignIn, signOut as authSignOut } from "@/auth";
import { CredentialsSignin } from "@auth/core/errors";
import { hashPassword } from "@/lib/auth/password";
import { hasDatabaseEnv, withTransaction } from "@/lib/db";
import { users } from "@/lib/db/repo";
import { randomBytes } from "node:crypto";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "At least 8 characters"),
});

export type AuthState = { error: string } | null;

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20) || "org"
  );
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasDatabaseEnv()) {
    return { error: "Database is not configured. Set DATABASE_URL in .env.local." };
  }
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await authSignIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof CredentialsSignin) {
      return { error: "Invalid email or password." };
    }
    return { error: "Sign-in failed. Please try again." };
  }
  const next = String(formData.get("next") || "/dashboard");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasDatabaseEnv()) {
    return { error: "Database is not configured. Set DATABASE_URL in .env.local." };
  }
  const name = String(formData.get("full_name") || "").trim();
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!name) return { error: "Full name is required" };

  const existing = await users.getByEmail(parsed.data.email);
  if (existing) {
    return { error: "A user with this email already exists. Sign in instead." };
  }

  // Replicates the old signup trigger: user row + own org + owner membership,
  // created atomically in code (Auth.js has no trigger mechanism).
  try {
    await withTransaction(async (client) => {
      const passwordHash = await hashPassword(parsed.data.password);
      const { rows } = await client.query<{ id: string }>(
        `insert into public.users (name, email, password_hash, email_verified)
         values ($1, $2, $3, now())
         returning id`,
        [name, parsed.data.email, passwordHash],
      );
      const userId = rows[0].id;
      const orgName = `${name}'s Org`;
      const slug = `${slugify(name)}-${randomBytes(3).toString("hex")}`;
      const { rows: orgRows } = await client.query<{ id: string }>(
        `insert into public.organizations (name, slug) values ($1, $2)
         returning id`,
        [orgName, slug],
      );
      await client.query(
        `insert into public.org_members (org_id, user_id, role) values ($1::uuid, $2::uuid, 'owner')`,
        [orgRows[0].id, userId],
      );
    });
  } catch (err) {
    const message = (err as { code?: string; message?: string }).message ?? "";
    if ((err as { code?: string }).code === "23505" || /unique/i.test(message)) {
      return { error: "A user with this email already exists. Sign in instead." };
    }
    return { error: "Could not create the account. Please try again." };
  }

  // Auto sign-in with the just-created credentials, then land on the dashboard.
  try {
    await authSignIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    // Account exists; fall back to the login page with a friendly message.
    redirect("/login");
  }
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  await authSignOut({ redirectTo: "/login" });
}
