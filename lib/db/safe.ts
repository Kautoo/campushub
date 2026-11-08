/**
 * Safe DB accessor: null when DATABASE_URL is absent so pages render a
 * setup notice instead of crashing. Replaces the Supabase safe accessors.
 */
import type pg from "pg";
import { getPool, hasDatabaseEnv } from "./index";

/** True when DATABASE_URL is present — gates setup-notice rendering. */
export function hasDbEnv(): boolean {
  return hasDatabaseEnv();
}

/**
 * Return the pool or null when the database is unconfigured. Callers treat
 * null exactly like the old `getSupabaseServerSafe()` null (setup notice /
 * honest 503).
 */
export function getDbSafe(): pg.Pool | null {
  if (!hasDatabaseEnv()) return null;
  try {
    return getPool();
  } catch {
    return null;
  }
}
