import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import {
  aiConfigured,
  aiModel,
  aiModelId,
  GROUNDED_SYSTEM_PROMPT,
} from "@/lib/ai";
import { buildMetricsPack } from "@/lib/metrics";
import { streamText } from "ai";
import { aiInsights } from "@/lib/db/repo";


const bodySchema = { message: "string (min 1)" };

/**
 * Streaming "Ask your data" chat. Each turn re-grounds the model with a
 * freshly built metrics pack. Streams plain text chunks.
 */
export async function POST(request: Request) {
  if (!aiConfigured()) {
    return Response.json({ error: "ai_not_configured" }, { status: 503 });
  }
  const db = getDbSafe();
  if (!db) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  const session = await getSessionContext();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  let message = "";
  try {
    const body = (await request.json()) as { message?: unknown };
    if (typeof body.message === "string" && body.message.trim().length > 0) {
      message = body.message.slice(0, 2000);
    }
  } catch {
    return Response.json({ error: "invalid_body", expected: bodySchema }, { status: 400 });
  }
  if (!message) {
    return Response.json({ error: "invalid_body", expected: bodySchema }, { status: 400 });
  }

  const orgId = session.orgIds[0];
  if (!orgId) return Response.json({ error: "no_org" }, { status: 400 });

  const pack = await buildMetricsPack(orgId, 30);
  if (!pack) return Response.json({ error: "pack_failed" }, { status: 500 });

  // Persist the question with the grounding window for audit
  await aiInsights.insert({
    org_id: orgId,
    kind: "chat",
    prompt: message,
    model: aiModelId(),
    data_window: { since: pack.window.since },
  });

  const result = streamText({
    model: aiModel(),
    system: GROUNDED_SYSTEM_PROMPT,
    prompt: `Metrics pack (integer cents, MYR):\n${JSON.stringify(pack)}\n\nOrganizer question: ${message}`,
  });

  return result.toTextStreamResponse();
}
