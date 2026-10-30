import "server-only";

/**
 * CampusHub Server Boundary Entry Point
 *
 * All files in `src/server/` are strictly server-only. They handle:
 * - Direct database interactions and administrative Supabase queries
 * - PayPal Checkout & Orders API integration boundaries (planned)
 * - AI model provider API integrations (planned)
 * - Privileged business operations, payment verification, and webhooks
 *
 * Client components must NEVER import modules from `src/server/`.
 * All client-to-server communication occurs via Next.js Route Handlers
 * (`src/app/api/...`) or Server Actions.
 */

export const SERVER_BOUNDARY = true;

export * from "./auth";
export * from "./api-response";
export * from "./db/repository";
export * from "./db/client";
export * from "./paypal";
export * from "./ai";

