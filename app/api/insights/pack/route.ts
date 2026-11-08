import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { buildMetricsPack } from "@/lib/metrics";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";

/**
 * Metrics pack: real aggregates for one org, computed with repo-scoped reads.
 * This is the ONLY data source the AI may use (grounding contract).
 *
 * Auth, two ways:
 *  1. Auth.js session cookie (dashboard users) — org = the caller's first org.
 *  2. Bearer token listed in PACK_API_TOKENS (comma-separated; machine agents
 *     such as the Astropods analyst) — org = the demo org the tokens are
 *     provisioned for. Constant-time comparison.
 */
const bodySchema = z.object({
  window_days: z.coerce.number().int().min(7).max(365).default(30),
});

/** Org a machine token is bound to (fixed demo org). */
const MACHINE_TOKEN_ORG_ID = "00000000-0000-4000-8000-000000000001";

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function tokenAllowed(token: string): boolean {
  const configured = (process.env.PACK_API_TOKENS ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (configured.length === 0) return false;
  const supplied = Buffer.from(token, "utf8");
  return configured.some((candidate) => {
    const expected = Buffer.from(candidate, "utf8");
    return (
      expected.length === supplied.length && timingSafeEqual(expected, supplied)
    );
  });
}

export async function POST(request: Request) {
  const db = getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const token = bearerToken(request);
  let orgId: string | undefined;

  if (token) {
    if (!tokenAllowed(token)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    orgId = MACHINE_TOKEN_ORG_ID;
  } else {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    orgId = session.orgIds[0];
    if (!orgId) return NextResponse.json({ error: "no_org" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const windowDays = parsed.success ? parsed.data.window_days : 30;

  const pack = await buildMetricsPack(orgId, windowDays);
  if (!pack) return NextResponse.json({ error: "pack_failed" }, { status: 500 });

  return NextResponse.json(pack);
}
