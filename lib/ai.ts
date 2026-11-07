/**
 * Vercel AI SDK setup — OpenAI-compatible gateway.
 * Grounding contract: insights are generated ONLY from a metrics pack built
 * from real DB aggregates (see /api/insights/pack). The system prompt forbids
 * numbers outside the pack. Without AI_* env vars the UI shows a setup
 * notice and buttons are disabled — never fabricated output.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_BASE_URL && process.env.AI_API_KEY);
}

export function aiModelId(): string {
  return process.env.AI_MODEL ?? "glm-5.3-flash";
}

export function aiModel() {
  if (!aiConfigured()) {
    throw new Error(
      "AI gateway is not configured. Set AI_BASE_URL and AI_API_KEY.",
    );
  }
  const provider = createOpenAICompatible({
    name: "campushub-gateway",
    baseURL: process.env.AI_BASE_URL!,
    apiKey: process.env.AI_API_KEY!,
  });
  return provider(aiModelId());
}

export const GROUNDED_SYSTEM_PROMPT = `You are the CampusHub Commerce Analyst for a campus events & commerce platform.
You answer organizer questions strictly from the metrics pack provided in the user message.

Rules:
- Use ONLY numbers present in the metrics pack. NEVER invent, extrapolate, or estimate numbers.
- Currency is MYR (RM). Amounts in the pack are integer cents — divide by 100 for display (RM 45,230.00).
- If a metric is absent from the pack, say "not available in current data" and suggest what data would be needed.
- Be concise: 2-4 short paragraphs max, or a tight bullet list.
- Surface anomalies (refund spikes, sell-through outliers, low stock) when visible in the pack.
- Never expose customer emails or personal data — the pack contains aggregates only.`;
