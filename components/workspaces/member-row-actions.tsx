"use client";

import { useState, useTransition } from "react";
import { updateMemberRole, removeMember } from "@/app/actions/members";
import type { MemberRow } from "@/components/settings/members-grid";

/** Per-row role select + remove button for the members grid. */
export function MemberRowActions({ row }: { row: MemberRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changeRole = (role: string) => {
    setError(null);
    startTransition(async () => {
      const res = await updateMemberRole(row.id, role);
      if (res?.error) setError(res.error);
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const res = await removeMember(row.id);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <span className="flex items-center gap-2">
      <select
        value={row.role}
        disabled={pending}
        onChange={(e) => changeRole(e.target.value)}
        className="h-8 rounded-md border border-outline-variant bg-surface-lowest px-2 text-label-md text-on-surface focus:border-secondary focus:outline-none"
        aria-label={`Role for ${row.full_name}`}
      >
        <option value="owner">owner</option>
        <option value="admin">admin</option>
        <option value="staff">staff</option>
      </select>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        title={`Remove ${row.full_name}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-error transition hover:bg-error-container disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">
          {pending ? "progress_activity" : "person_remove"}
        </span>
      </button>
      {error ? (
        <span className="text-label-sm text-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
