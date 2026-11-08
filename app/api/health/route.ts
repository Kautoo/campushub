import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/db/safe";
import type { PoolClient } from "pg";

/**
 * Render health check: verifies env presence and (when configured) database
 * reachability. Never reports ok when prerequisites are missing.
 */
export async function GET() {
  const db = getDbSafe();
  const checks: Record<string, string> = {
    database_configured: db ? "ok" : "missing",
    paypal_configured:
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
        ? "ok"
        : "missing",
    ai_configured:
      process.env.AI_BASE_URL && process.env.AI_API_KEY ? "ok" : "missing",
  };

  if (db) {
    try {
      const { promise: timeout, reject } = Promise.withResolvers<never>();
      const timer = setTimeout(() => reject(new Error("timeout")), 4000);
      let client: PoolClient;
      try {
        client = await Promise.race([db.connect(), timeout]);
      } finally {
        clearTimeout(timer);
      }
      try {
        await client.query("select 1");
        checks.database_reachable = "ok";
      } finally {
        client.release();
      }
    } catch {
      checks.database_reachable = "unreachable";
    }
  }

  const healthy = checks.database_configured === "ok";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
