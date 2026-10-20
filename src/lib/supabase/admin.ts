import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an administrative Supabase client using the service role key.
 * Strictly restricted to server-side privileged operations (e.g. background tasks, webhooks).
 * NEVER expose this or import this in client-side code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

