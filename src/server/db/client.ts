import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a server-side Supabase client when valid environment credentials are provided.
 * Returns null if Supabase is unconfigured or using placeholder values.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !key ||
    url.includes("your-project-id") ||
    key.includes("your-supabase")
  ) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
