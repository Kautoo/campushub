import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { runAstropodsAgent, aiModelId } from "@/lib/ai";
import { buildMetricsPack } from "@/lib/metrics";
import { aiInsights } from "@/lib/db/repo";

const bodySchema = { message: "string (min 1)" };

/**
 * Streaming "Ask your data" chat powered exclusively by the Astropods Analyst Agent.
 * Each turn grounds the agent with a freshly built metrics pack.
 */
export async function POST(request: Request) {
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

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/ch-active-org=([a-f0-9-]+)/i);
  const activeOrgCookie = match ? match[1] : null;
  const orgId =
    activeOrgCookie && session.orgIds.includes(activeOrgCookie)
      ? activeOrgCookie
      : session.orgIds[0];
  if (!orgId) return Response.json({ error: "no_org" }, { status: 400 });

  const pack = await buildMetricsPack(orgId, 30);
  if (!pack) return Response.json({ error: "pack_failed" }, { status: 500 });

  let reply = "";
  try {
    reply = await runAstropodsAgent(message, pack as never);
    await aiInsights.insert({
      org_id: orgId,
      kind: "chat",
      prompt: message,
      response: reply,
      model: aiModelId(),
      data_window: { since: pack.window.since },
    });
  } catch (err) {
    console.error("Astropods chat agent failed", err);
    reply = "Astropods Commerce Analyst: I was unable to complete the query at this moment. Please verify your metrics data or try again.";
  }
  // Stream text response to simulate streaming chunks
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = reply.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(encoder.encode(chunk));
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 12);
        await promise;
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
