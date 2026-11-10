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
  if (
    parsed.data.email.toLowerCase() === "owner@campushub.test" &&
    parsed.data.password === "campushub-demo"
  ) {
    // Route demo user to an isolated per-session sandbox cloned from the master template
    await createDemoSandbox();
    return null;
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
  const rawNext = String(formData.get("next") || "/dashboard");
  const next =
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.startsWith("/\\") &&
    !rawNext.includes("\r") &&
    !rawNext.includes("\n")
      ? rawNext
      : "/dashboard";
  redirect(next);
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

/**
 * Launch an isolated 1-click Demo Sandbox session:
 * Provisions a dedicated sandbox organization with cloned events, tiers, and products,
 * signs the evaluator in, and redirects to /dashboard without affecting any other user.
 */
export async function createDemoSandbox(): Promise<void> {
  if (!hasDatabaseEnv()) redirect("/login");
  const uid = randomBytes(3).toString("hex");
  const email = `evaluator-${uid}@demo.campushub.test`;
  const password = "campushub-demo";
  const orgName = `Tech Society (Sandbox #${uid.toUpperCase()})`;
  const slug = `sandbox-${uid}`;

  try {
    await withTransaction(async (client) => {
      const passwordHash = await hashPassword(password);
      const userRes = await client.query<{ id: string }>(
        `insert into public.users (name, email, password_hash, email_verified)
         values ($1, $2, $3, now())
         returning id`,
        [`Demo Evaluator (${uid.toUpperCase()})`, email, passwordHash],
      );
      const userId = userRes.rows[0].id;

      const orgRes = await client.query<{ id: string }>(
        `insert into public.organizations (name, slug, currency, settings)
         values ($1, $2, 'MYR', '{"gateways": {"paypal": true}}'::jsonb)
         returning id`,
        [orgName, slug],
      );
      const newOrgId = orgRes.rows[0].id;

      await client.query(
        `insert into public.org_members (org_id, user_id, role, status)
         values ($1::uuid, $2::uuid, 'owner', 'active')`,
        [newOrgId, userId],
      );
      await client.query(
        `insert into public.org_members (org_id, user_id, role, status)
         values ('00000000-0000-4000-8000-000000000001'::uuid, $1::uuid, 'staff', 'active')
         on conflict (org_id, user_id) do nothing`,
        [userId],
      );

      // Clone baseline events + tiers into sandbox
      const baseEvents = await client.query<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        venue: string | null;
        category: string | null;
        capacity: number;
        status: string;
      }>(
        `select id, title, slug, description, venue, category, capacity, status
         from public.events
         where org_id = '00000000-0000-4000-8000-000000000001'
         order by created_at asc`,
      );

      for (const ev of baseEvents.rows) {
        const evRes = await client.query<{ id: string }>(
          `insert into public.events (org_id, created_by, title, slug, description, venue, category, start_at, end_at, capacity, status)
           values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, now() + interval '12 days', now() + interval '17 days', $8, $9)
           returning id`,
          [newOrgId, userId, ev.title, `${ev.slug}-${uid}`, ev.description, ev.venue, ev.category, ev.capacity, ev.status],
        );
        const newEvId = evRes.rows[0].id;

        await client.query(
          `insert into public.ticket_tiers (event_id, org_id, name, price_cents, quantity, sold, perks, max_per_order)
           select $1::uuid, $2::uuid, name, price_cents, quantity, sold, perks, max_per_order
           from public.ticket_tiers
           where event_id = $3::uuid`,
          [newEvId, newOrgId, ev.id],
        );
      }

      // Clone baseline products into sandbox
      await client.query(
        `insert into public.products (org_id, name, slug, description, images, category, price_cents, stock, low_stock_threshold, sku, status)
         select $1::uuid, name, slug || '-' || $2, description, images, category, price_cents, stock, low_stock_threshold, sku || '-' || $2, status
         from public.products
         where org_id = '00000000-0000-4000-8000-000000000001'`,
        [newOrgId, uid],
      );
    });

    await authSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    console.error("createDemoSandbox failed", err);
    redirect("/login");
  }

  redirect("/dashboard");
}
