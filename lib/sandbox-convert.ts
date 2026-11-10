"use client";

import { createDemoSandbox } from "@/app/actions/auth";

/** sessionStorage key carrying the editor to reopen after auto-conversion. */
const PENDING_KEY = "ch-sandbox-convert";

/**
 * Automatically convert the current session (e.g. the shared owner demo login)
 * into a fresh private sandbox, then reload so the route re-renders with full
 * editing rights. The `pending` tag is stashed before launch; the workspace
 * consumes it on mount to reopen the editor the user originally clicked or to
 * show the conversion notice.
 */
export async function autoConvertToSandbox(pending: string): Promise<void> {
  sessionStorage.setItem(PENDING_KEY, pending);
  try {
    await createDemoSandbox();
  } catch {
    // NEXT_REDIRECT (login fallback when the DB is unconfigured) or a network
    // failure: the reload below re-resolves the session server-side either way.
  } finally {
    window.location.reload();
  }
}

/** Returns and clears the pending post-conversion action tag, if any. */
export function consumePendingSandboxAction(): string | null {
  const value = sessionStorage.getItem(PENDING_KEY);
  if (value !== null) sessionStorage.removeItem(PENDING_KEY);
  return value;
}
