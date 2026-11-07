/**
 * Safe client accessors: return null when Supabase env vars are absent so
 * pages can render a setup notice instead of crashing.
 */
import { supabaseServer, supabaseAdmin, supabasePublic, type Database } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getSupabaseServerSafe(): Promise<SupabaseClient<Database> | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    return await supabaseServer();
  } catch {
    return null;
  }
}

export function getSupabaseAdminSafe(): SupabaseClient | null {
  try {
    return supabaseAdmin();
  } catch {
    return null;
  }
}

/** Public (anon, cookie-less) client or null when Supabase env is absent. */
export function getSupabasePublicSafe(): SupabaseClient<Database> | null {
  if (!hasSupabaseEnv()) return null;
  try {
    return supabasePublic();
  } catch {
    return null;
  }
}
