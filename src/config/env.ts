import { clientEnvSchema, serverEnvSchema, type ClientEnv, type ServerEnv } from "@/lib/validations/env";

/**
 * Validates and retrieves browser-accessible environment variables.
 */
export function getClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    console.error("Invalid client environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables. Check .env configuration.");
  }

  return result.data;
}

/**
 * Validates and retrieves server-only environment variables.
 * Enforces that secrets cannot be accessed in browser environments.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv cannot be called from the browser bundle.");
  }

  const result = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_BASE_URL: process.env.PAYPAL_BASE_URL,
    AI_API_KEY: process.env.AI_API_KEY,
  });

  if (!result.success) {
    console.error("Invalid server environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables. Check .env configuration.");
  }

  return result.data;
}

