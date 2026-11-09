"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@heroui/react";
import { signUp, type AuthState } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <Badge tone="teal" icon="domain_add">
          Society Onboarding
        </Badge>
        <h1 className="text-headline-lg font-bold text-on-surface mt-2">
          Create your workspace
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          An isolated Postgres organization workspace is provisioned for your
          society automatically.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Full Name
          </span>
          <input
            name="full_name"
            required
            autoComplete="name"
            placeholder="Aminah Hassan"
            className="focus-aura mt-1.5 h-11 w-full rounded-xl border border-outline-variant/70 bg-surface-low px-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:bg-surface-lowest"
          />
        </label>
        <label className="block">
          <span className="text-label-md font-semibold text-on-surface">
            Institutional Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@campus.edu.my"
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
          {pending ? "Creating workspace…" : "Create Society Workspace"}
        </Button>
      </form>

      <div className="rounded-xl border border-outline-variant/50 bg-surface-low p-3.5 text-body-sm text-on-surface-variant">
        Want to inspect the seeded{" "}
        <strong className="text-on-surface">Tech Society</strong> dataset (6
        events, 12 products, 40 orders)?{" "}
        <Link href="/login" className="text-secondary font-semibold hover:underline">
          Sign in with the demo account →
        </Link>
      </div>

      <p className="text-body-sm text-on-surface-variant text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-secondary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
