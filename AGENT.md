# CampusHub Analyst — Astropods Agent

An autonomous **commerce analyst agent** for CampusHub 2.0, deployed via
Astropods. It answers organizer questions about revenue, ticket sell-through,
cart abandonment, refunds, and inventory — **strictly grounded** in the live
metrics pack from the CampusHub API. It never sees raw PII and never invents
numbers.

## Files

| File | Purpose |
|---|---|
| `agents/astropods.yml` | Declarative agent blueprint (Astropods `apiVersion: astropods.ai/v1`) — model, knowledge source, tools, system prompt, guardrails |
| `app/api/insights/pack/route.ts` | The grounded knowledge endpoint the agent reads (session-authenticated, org-scoped) |
| `lib/metrics.ts` | Builds the metrics pack from real SQL aggregates |

## What the agent does

- **Answers questions like a junior analyst**: "How did VIP sales do last
  week?", "Which products are low on stock?", "What's our refund rate?"
- **Cites only pack fields** — revenue by day, top products, tier
  sell-through, refund totals, low-stock counts. If a metric is absent from
  the pack, it says so instead of guessing.
- **Knows the money format**: amounts are integer cents, currency MYR (RM);
  it divides by 100 for display.
- **Refreshes knowledge** every 15 minutes from the metrics-pack endpoint
  (POST, `Authorization: Bearer ${ASTROPODS_PACK_TOKEN}`).

## Setup

1. Deploy the CampusHub web service (see README → Deploy to Render). The
   agent's knowledge endpoint must be publicly reachable.
2. Create an Astropods account and obtain `ASTROPODS_API_KEY`.
3. Issue a **pack token** your agent will present as
   `Authorization: Bearer <token>` against `/api/insights/pack`, and set it
   as `ASTROPODS_PACK_TOKEN` in the agent environment.
4. Set the LLM gateway env vars used by the blueprint: `AI_BASE_URL`,
   `AI_API_KEY`, `AI_MODEL` (default `glm-5.3-flash`).
5. Deploy the blueprint:
   ```bash
   astropods deploy agents/astropods.yml
   ```

## Environment variables (agent-side)

| Variable | Purpose |
|---|---|
| `ASTROPODS_API_KEY` | Astropods account key for deploying/managing the agent |
| `ASTROPODS_PACK_TOKEN` | Bearer token the agent presents to the metrics-pack endpoint |
| `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL` | OpenAI-compatible LLM gateway the agent reasons with |

## Guardrails (enforced in `agents/astropods.yml`)

- `no-pii` — knowledge is aggregate metrics only; orders/registrations are
  never exposed row-by-row.
- `no-fabrication` — responses must cite pack fields; absent metrics are
  answered with "not in the pack", never invented numbers.
- `grounding: strict` on the knowledge source.

## Alternative: in-app AI (no Astropods)

The dashboard's `/dashboard/ai-insights` pages use the same metrics pack
directly through the Vercel AI SDK (`POST /api/insights`,
`/api/insights/chat`) — that path is fully implemented and does not require
an Astropods account. The Astropods agent is the standalone/external
analyst option.
