/**
 * CampusHub Analyst — Astropods agent entrypoint (Mastra-compatible shape,
 * plain fetch so no framework dependency is required).
 *
 * Messaging protocol: each inbound user message is grounded with a freshly
 * fetched metrics pack, then answered by the LLM. The system prompt and
 * grounding rules mirror the in-app implementation (lib/ai.ts).
 */

export interface Env {
  ASTRO_GATEWAY_URL?: string;
  ASTRO_GATEWAY_API_KEY?: string;
  MODEL_DEFAULT?: string;
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  AI_MODEL?: string;
  PACK_TOKEN?: string;
  PACK_ENDPOINT?: string;
}

const SYSTEM_PROMPT = `You are the CampusHub Commerce Analyst for a campus events & commerce platform.
You answer organizer questions strictly from the metrics pack provided in the user message.

Rules:
- Use ONLY numbers present in the metrics pack. NEVER invent, extrapolate, or estimate numbers.
- Currency is MYR (RM). Amounts in the pack are integer cents — divide by 100 for display (RM 45,230.00).
- If a metric is absent from the pack, say "not available in current data" and suggest what data would be needed.
- Be concise: 2-4 short paragraphs max, or a tight bullet list.
- Surface anomalies (refund spikes, sell-through outliers, low stock) when visible in the pack.
- Never expose customer emails or personal data — the pack contains aggregates only.`;

export async function fetchMetricsPack(env: Env): Promise<string> {
  const url = env.PACK_ENDPOINT;
  const token = env.PACK_TOKEN;
  if (!url || !token) {
    return "Metrics pack unavailable: PACK_ENDPOINT or PACK_TOKEN not configured.";
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return `Metrics pack unavailable (HTTP ${res.status}). Do not answer with numbers.`;
    }
    return await res.text();
  } catch (err) {
    return `Metrics pack fetch failed: ${(err as Error).message}. Do not answer with numbers.`;
  }
}

/** Answer one user message, grounded in a fresh metrics pack. */
export async function handleMessage(
  userMessage: string,
  env: Env,
): Promise<string> {
  const pack = await fetchMetricsPack(env);

  const baseUrl = env.ASTRO_GATEWAY_URL ?? env.AI_BASE_URL;
  const apiKey = env.ASTRO_GATEWAY_API_KEY ?? env.AI_API_KEY;
  const model =
    env.MODEL_DEFAULT ?? env.AI_MODEL ?? "claude-sonnet-4-6";

  if (!baseUrl || !apiKey) {
    return "LLM gateway is not configured (ASTRO_GATEWAY_URL / ASTRO_GATEWAY_API_KEY missing).";
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Metrics pack (the ONLY data source you may cite):\n${pack}\n\nQuestion: ${userMessage}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    return `Model call failed (HTTP ${res.status}).`;
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return (
    data.choices?.[0]?.message?.content ??
    "The model returned no content for this question."
  );
}
