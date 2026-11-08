/**
 * Minimal HTTP server wrapping handleMessage() — enough for the Astropods
 * messaging sidecar and `ast project start`. Accepts:
 *   POST /           { message: string } | { text: string } | MessageEvent-ish
 *   GET  /health     -> 200 ok
 * Replies with JSON { reply: string } (or plain text when asked via
 * Accept: text/plain).
 */
import { handleMessage, type Env } from "./index";

const env: Env = {
  ASTRO_GATEWAY_URL: process.env.ASTRO_GATEWAY_URL,
  ASTRO_GATEWAY_API_KEY: process.env.ASTRO_GATEWAY_API_KEY,
  MODEL_DEFAULT: process.env.MODEL_DEFAULT,
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL: process.env.AI_MODEL,
  PACK_TOKEN: process.env.PACK_TOKEN,
  PACK_ENDPOINT: process.env.PACK_ENDPOINT,
};

function extractMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  for (const key of ["message", "text", "input", "query", "content"]) {
    if (typeof b[key] === "string" && (b[key] as string).trim()) {
      return b[key] as string;
    }
  }
  // MessageEvent shape: { data: { text } } or { data: string }
  if (typeof b.data === "string") return b.data;
  if (typeof b.data === "object" && b.data !== null) {
    const d = b.data as Record<string, unknown>;
    if (typeof d.text === "string") return d.text;
  }
  return null;
}

/** Minimal HTTP server (Node 18+/Bun compatible, no framework). */
const port = Number(process.env.PORT ?? 80);

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/")) {
    return Response.json({ status: "ok", agent: "campushub-analyst" });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const message = extractMessage(body);
  if (!message) {
    return Response.json(
      { error: "missing_message", hint: 'send {"message": "..."}' },
      { status: 400 },
    );
  }
  try {
    const reply = await handleMessage(message, env);
    const wantsText = (req.headers.get("accept") ?? "").includes("text/plain");
    return new Response(wantsText ? reply : JSON.stringify({ reply }), {
      headers: {
        "content-type": wantsText ? "text/plain; charset=utf-8" : "application/json",
      },
    });
  } catch (err) {
    console.error("agent handling failed", err);
    return Response.json({ error: "processing_error" }, { status: 500 });
  }
}

// Node runtime entry. Static import of node:http is fine on Node; on Bun,
// node:http is also supported, so one entry covers both runtimes.
import { createServer } from "node:http";
createServer(async (req, res) => {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(", "));
  }
  const body = await new Promise<string | null>((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data || null));
  });
  const response = await handleRequest(
    new Request(url, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
    }),
  );
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}).listen(port, () => console.log(`campushub-analyst listening on :${port}`));
