import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/db/safe";
import { aiProviderInfo } from "@/lib/ai";
import { paypalEnvLabel, paypalCurrency, paypalConfigured } from "@/lib/paypal";
import type { PoolClient } from "pg";

/**
 * Health & Operational Audit Route:
 * 1. Verifies database connectivity and measures round-trip ping latency.
 * 2. Compiles live row counts across primary database tables for instant audits.
 * 3. Inspects AI engine status (Custom LLM vs. Native Grounded Engine).
 * 4. Verifies PayPal Orders v2 configuration, environment, and webhook bindings.
 * 5. Returns HTTP 200 with full audit diagnostics when healthy; HTTP 503 degraded when database is unavailable.
 */
export async function GET() {
  const db = getDbSafe();
  const aiInfo = aiProviderInfo();

  const checks: Record<string, string> = {
    database_configured: db ? "ok" : "missing",
    paypal_configured: paypalConfigured() ? "ok" : "missing",
    ai_configured: aiInfo.mode === "custom-llm" ? "ok" : "grounded-engine",
  };

  let dbLatencyMs: number | null = null;
  let tableCounts: Record<string, number> | null = null;

  if (db) {
    try {
      const { promise: timeout, reject } = Promise.withResolvers<never>();
      const timer = setTimeout(() => reject(new Error("timeout")), 4000);
      let client: PoolClient;
      const start = Date.now();
      try {
        client = await Promise.race([db.connect(), timeout]);
      } finally {
        clearTimeout(timer);
      }
      try {
        await client.query("select 1");
        dbLatencyMs = Date.now() - start;
        checks.database_reachable = "ok";

        const countsRes = await client.query<{
          orgs: string;
          events: string;
          products: string;
          orders: string;
          transactions: string;
          users: string;
          files: string;
        }>(
          `select
             (select count(*) from public.organizations) as orgs,
             (select count(*) from public.events) as events,
             (select count(*) from public.products) as products,
             (select count(*) from public.orders) as orders,
             (select count(*) from public.transactions) as transactions,
             (select count(*) from public.users) as users,
             (select count(*) from public.files) as files`,
        );
        const row = countsRes.rows[0];
        if (row) {
          tableCounts = {
            organizations: Number(row.orgs),
            events: Number(row.events),
            products: Number(row.products),
            orders: Number(row.orders),
            transactions: Number(row.transactions),
            users: Number(row.users),
            files: Number(row.files),
          };
        }
      } finally {
        client.release();
      }
    } catch {
      checks.database_reachable = "unreachable";
    }
  }

  const healthy =
    checks.database_configured === "ok" &&
    checks.database_reachable !== "unreachable";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      node_version: process.version,
      checks,
      audit: {
        database: {
          status: checks.database_reachable ?? "not_connected",
          latency_ms: dbLatencyMs,
          table_counts: tableCounts,
        },
        ai_engine: {
          mode: aiInfo.mode,
          provider: aiInfo.provider,
          model: aiInfo.model,
          endpoint: aiInfo.endpoint,
        },
        payment_gateway: {
          provider: "paypal-orders-v2",
          configured: paypalConfigured(),
          environment: paypalEnvLabel(),
          currency: paypalCurrency(),
          webhook_configured: Boolean(process.env.PAYPAL_WEBHOOK_ID),
        },
        security: {
          auth_secret_configured: Boolean(process.env.AUTH_SECRET),
          file_signing_hmac: Boolean(process.env.AUTH_SECRET),
        },
      },
    },
    { status: healthy ? 200 : 503 },
  );
}
