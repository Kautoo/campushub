import { NextResponse } from "next/server";

/**
 * Render health check: verifies env presence and (when configured) Supabase
 * reachability. Never reports ok when prerequisites are missing.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const checks: Record<string, string> = {
    supabase_configured: supabaseUrl ? "ok" : "missing",
    paypal_configured:
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
        ? "ok"
        : "missing",
    ai_configured:
      process.env.AI_BASE_URL && process.env.AI_API_KEY ? "ok" : "missing",
  };

  if (supabaseUrl) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
        signal: AbortSignal.timeout(4000),
      });
      checks.supabase_reachable = res.ok ? "ok" : `http_${res.status}`;
    } catch {
      checks.supabase_reachable = "unreachable";
    }
  }

  const healthy = checks.supabase_configured === "ok";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
