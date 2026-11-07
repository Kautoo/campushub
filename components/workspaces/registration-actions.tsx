"use client";

import { useState, useTransition } from "react";
import {
  updateRegistrationStatus,
} from "@/app/actions/registrations";

export type RegistrationStatus = "pending" | "confirmed" | "checked_in" | "cancelled";

/** Per-row status dropdown + check-in button, wired to the registrations server actions. */
export function RegistrationActions({
  id,
  status,
  disabled,
}: {
  id: string;
  status: RegistrationStatus;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changeStatus = (next: RegistrationStatus) => {
    // "pending" is display-only: the server action accepts no pending transition.
    if (next === "pending" || next === status) return;
    setError(null);
    startTransition(async () => {
      const result = await updateRegistrationStatus(id, next);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Registration status"
        value={status}
        disabled={pending || disabled}
        onChange={(e) => changeStatus(e.target.value as RegistrationStatus)}
        className="h-8 rounded-lg border border-outline-variant bg-surface-low px-2 text-label-md text-ink outline-none disabled:opacity-50"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="checked_in">Checked in</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {status !== "checked_in" && status !== "cancelled" ? (
        <button
          type="button"
          disabled={pending || disabled}
          onClick={() => changeStatus("checked_in")}
          className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-label-sm text-primary-container transition-transform hover:-translate-y-px disabled:opacity-50 dark:bg-secondary/15 dark:text-secondary"
        >
          <span className="material-symbols-outlined text-[14px]">task_alt</span>
          {pending ? "…" : "Check in"}
        </button>
      ) : null}
      {error ? <span className="text-label-sm text-error">{error}</span> : null}
    </div>
  );
}
