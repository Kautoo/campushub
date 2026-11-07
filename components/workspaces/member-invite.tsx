"use client";

import { useActionState } from "react";
import { inviteMember, type MemberActionResult } from "@/app/actions/members";

const NOTICES: Record<string, string> = {
  service_role_missing:
    "Service-role key required for invites — set SUPABASE_SERVICE_ROLE_KEY to enable email invitations.",
};

/** Email + role invite form for the Members workspace. */
export function MemberInvite() {
  const [state, formAction, pending] = useActionState<MemberActionResult, FormData>(
    inviteMember,
    null,
  );

  const errorText = state?.error
    ? (NOTICES[state.error] ?? state.error)
    : null;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="teammate@campus.edu"
          className="h-10 min-w-64 flex-1 rounded-lg border border-outline-variant bg-surface-lowest px-3 text-body-md text-ink placeholder:text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
        />
        <select
          name="role"
          defaultValue="staff"
          className="h-10 rounded-lg border border-outline-variant bg-surface-lowest px-3 text-body-md text-ink focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-label-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-primary dark:text-on-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">
            {pending ? "progress_activity" : "person_add"}
          </span>
          {pending ? "Inviting…" : "Invite"}
        </button>
      </div>
      {errorText ? (
        <p className="flex items-center gap-2 rounded-lg bg-warning-container px-3 py-2 text-body-sm text-warning">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          {errorText}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="flex items-center gap-2 rounded-lg bg-success-container px-3 py-2 text-body-sm text-success">
          <span className="material-symbols-outlined text-[18px]">
            check_circle
          </span>
          {state.ok}
        </p>
      ) : null}
    </form>
  );
}
