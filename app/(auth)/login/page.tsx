"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@heroui/react";
import { signIn, type AuthState } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    async (prev, fd) => {
      const next = (await searchParams).next ?? "/dashboard";
      fd.set("next", next);
      return signIn(prev, fd);
    },
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <Badge tone="teal" icon="verified_user">
          Organizer Portal
        </Badge>
        <h1 className="text-headline-lg font-bold text-on-surface mt-2">
          Welcome back
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Sign in to access your CampusHub 2.0 organizer console, Bryntum
          timelines, and AG Grid ledgers.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Institutional Email
          </span>
          <input
            name="email"
            type="email"
            required
            defaultValue="owner@campushub.test"
            autoComplete="email"
            placeholder="owner@campushub.test"
            className="focus-aura mt-1.5 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
          />
        </label>
        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            defaultValue="campushub-demo"
            autoComplete="current-password"
            placeholder="••••••••"
            className="focus-aura mt-1.5 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
          />
        </label>

        {state?.error ? (
          <p
            role="alert"
            className="rounded-xl border border-error/30 bg-error-container px-3.5 py-2.5 text-body-sm text-on-error-container"
          >
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          isDisabled={pending}
          className="h-11 w-full rounded-full text-label-lg font-semibold"
        >
          {pending ? "Signing in…" : "Sign in to Workspace"}
        </Button>
      </form>

      {/* Demo Credentials Box */}
      <div className="rounded-xl border border-outline-variant/50 bg-surface-low p-3.5 text-body-sm space-y-1">
        <p className="font-semibold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            key
          </span>
          Seeded Tech Society Demo Accounts
        </p>
        <p className="text-on-surface-variant text-xs leading-relaxed">
          Email: <code className="font-mono text-on-surface">owner@campushub.test</code>{" "}
          (or <code className="font-mono text-on-surface">admin@campushub.test</code>) ·
          Password: <code className="font-mono text-on-surface">campushub-demo</code>
        </p>
      </div>

      <div className="pt-2 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-sm text-on-surface-variant">
        <span>
          New organizer?{" "}
          <Link href="/register" className="text-secondary font-semibold hover:underline">
            Create an account
          </Link>
        </span>
        <Link href="/demo" className="text-secondary font-semibold hover:underline">
          Visit Storefront →
        </Link>
      </div>
    </div>
  );
}
