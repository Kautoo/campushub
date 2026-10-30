import { z } from "zod";

/**
 * Client-side environment variables schema.
 * Only variables prefixed with NEXT_PUBLIC_ may be defined here.
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty")
    .optional(),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_PAYPAL_CLIENT_ID cannot be empty")
    .optional(),
});

/**
 * Server-only environment variables schema.
 * Privileged keys and secrets must never be exposed to the browser.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY cannot be empty")
    .optional(),
  PAYPAL_CLIENT_ID: z
    .string()
    .min(1, "PAYPAL_CLIENT_ID cannot be empty")
    .optional(),
  PAYPAL_CLIENT_SECRET: z
    .string()
    .min(1, "PAYPAL_CLIENT_SECRET cannot be empty")
    .optional(),
  PAYPAL_BASE_URL: z
    .string()
    .url("PAYPAL_BASE_URL must be a valid URL")
    .default("https://api-m.sandbox.paypal.com")
    .optional(),
  AI_API_KEY: z
    .string()
    .min(1, "AI_API_KEY cannot be empty")
    .optional(),
  ASTROPODS_API_KEY: z
    .string()
    .min(1, "ASTROPODS_API_KEY cannot be empty")
    .optional(),
  ASTROPODS_BASE_URL: z
    .string()
    .url("ASTROPODS_BASE_URL must be a valid URL")
    .optional(),
  ASTROPODS_MODEL: z
    .string()
    .min(1, "ASTROPODS_MODEL cannot be empty")
    .optional(),
  ASTRO_GATEWAY_URL: z
    .string()
    .url("ASTRO_GATEWAY_URL must be a valid URL")
    .optional(),
  ASTRO_GATEWAY_API_KEY: z
    .string()
    .min(1, "ASTRO_GATEWAY_API_KEY cannot be empty")
    .optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

