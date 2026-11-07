"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@heroui/react";
import { signUp, type AuthState } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    null,
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-headline-lg text-ink">Create your workspace</h1>
        <p className="text-body-md text-muted mt-1">
          An organization is created for you automatically.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <label className="block">
          <span className="text-label-md text-ink">Full name</span>
          <input
            name="full_name"
            required
            autoComplete="name"
            placeholder="Aminah Hassan"
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 text-body-md text-ink outline-none placeholder:text-muted"
          />
        </label>
        <label className="block">
          <span className="text-label-md text-ink">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@campus.edu.my"
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 text-body-md text-ink outline-none placeholder:text-muted"
          />
        </label>
        <label className="block">
          <span className="text-label-md text-ink">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="focus-aura mt-1 h-11 w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 text-body-md text-ink outline-none placeholder:text-muted"
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
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-body-sm text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold">
          Sign in
        </Link>
      </p>
      <p className="text-body-sm text-muted mt-4 rounded-lg bg-surface-container px-3 py-2 text-center">
        Using the demo? After registering, run{" "}
        <code className="font-mono text-[11px]">
          select public.join_demo_org();
        </code>{" "}
        in the Supabase SQL editor (or the in-app prompt on the dashboard) to
        attach the seeded Tech Society data.
      </p>
    </div>
  );
}
