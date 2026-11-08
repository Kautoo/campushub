"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@heroui/react";
import { signIn, type AuthState } from "@/app/actions/auth";

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
    <div>
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          Welcome back
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Sign in to your CampusHub organizer workspace.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <label className="block">
          <span className="text-label-md text-on-surface">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@campus.edu.my"
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
          />
        </label>
        <label className="block">
          <span className="text-label-md text-on-surface">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="••••••••"
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
          />
        </label>

        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-error"
          >
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          isDisabled={pending}
          className="h-11 w-full rounded-full text-label-lg"
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-body-sm text-on-surface-variant mt-6 text-center">
        New organizer?{" "}
        <Link href="/register" className="text-primary font-semibold">
          Create an account
        </Link>
      </p>
      <p className="text-body-sm text-on-surface-variant mt-2 text-center">
        Just browsing?{" "}
        <Link href="/demo" className="text-primary font-semibold">
          Visit the storefront
        </Link>
      </p>
    </div>
  );
}
