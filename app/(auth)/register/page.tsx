"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@heroui/react";
import { signUp, createDemoSandbox, type AuthState } from "@/app/actions/auth";
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

      <div className="space-y-2">
        <form action={createDemoSandbox}>
          <button
            type="submit"
            className="btn-step w-full inline-flex h-11 items-center justify-center gap-2 rounded-full border border-secondary/50 bg-secondary-container/35 px-4 text-label-md font-bold text-on-secondary-container hover:bg-secondary-container/60 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              science
            </span>
            <span>Or Launch 1-Click Sandbox Playground</span>
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-outline-variant/50 bg-surface-low p-3.5 text-body-sm text-on-surface-variant">
        Want to explore the seeded{" "}
        <strong className="text-on-surface">Tech Society</strong> showroom?{" "}
        <Link href="/login" className="text-secondary font-semibold hover:underline">
          Sign in with shared demo credentials →
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
