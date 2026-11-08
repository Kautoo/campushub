---
description: "CampusHub Analyst — grounded commerce analytics agent for a campus events & commerce platform"
tags:
  - analytics
  - commerce
  - grounded-ai
  - saas
authors:
  - name: Kautoo
    account: Kautoo
repository: "github:Kautoo/campushub"
capabilities:
  - Answers revenue, sell-through, refund, and inventory questions from live metrics
  - Re-grounds every answer on a freshly fetched metrics pack (15-minute freshness contract in the pack source)
  - Refuses to invent numbers — absent metrics are answered with "not available in current data"
integrations:
  - CampusHub Metrics Pack
---

# CampusHub Analyst

An autonomous **commerce analyst agent** for CampusHub 2.0, deployed via
Astropods. It answers organizer questions about revenue, ticket sell-through,
refunds, and inventory — **strictly grounded** in the live metrics pack from
the CampusHub API. It never sees raw PII and never invents numbers.

## Overview

CampusHub 2.0 is a campus events & commerce SaaS (ticketing, storefront,
PayPal payments). The analyst agent is the standalone/external way to "ask
your data": each user message triggers a fresh `POST` to the CampusHub
metrics-pack endpoint, and the model answers using **only** the numbers in
that pack — the same grounding contract the in-app AI chat uses
(`lib/ai.ts` → `GROUNDED_SYSTEM_PROMPT`).

The metrics pack contains: revenue by day, order status counts, top products
by revenue, ticket-tier sell-through, refund totals, and low-stock counts —
aggregates only, per-org scoped, never row-level customer data.

## Usage

Talk to the agent in chat (Astropods messaging interface — web chat/Slack)
or POST directly to its HTTP endpoint:

```bash
curl -X POST https://<agent-url>/ \
  -H "content-type: application/json" \
  -d '{"message": "How did VIP sales do last week?"}'
```

Response: `{"reply": "..."}` (or plain text with `Accept: text/plain`).

Example questions:

- "How did VIP sales do last week?"
- "Which products are low on stock?"
- "What's our refund rate this month?"
- "Which tier will sell out first?"

## How grounding works

1. User message arrives.
2. Agent fetches a **fresh metrics pack** (`PACK_ENDPOINT`, bearer
   `PACK_TOKEN`). If the fetch fails, it answers without numbers rather than
   guessing.
3. The pack is injected into the system context; the model may cite only
   pack fields. Amounts are integer cents — displayed as RM (divide by 100).
4. Anomalies (refund spikes, sell-through outliers, low stock) are surfaced
   proactively.

## Limitations

- Only metrics present in the pack are answerable; there is no row-level
  order/customer lookup by design (`no-pii`).
- One organization per pack token (the pack endpoint is org-scoped).
- Currency is MYR (RM).

## Project layout

```
agents/astropods.yml   Astropods blueprint (spec: blueprint/v1)
agents/Dockerfile      Agent image (node:22-alpine + tsx)
agents/AGENT.md        This file (Astropods agent card)
agents/agent/index.ts  Grounding + LLM call logic (system prompt mirrors lib/ai.ts)
agents/agent/server.ts Minimal HTTP/messaging server (Node 22 / tsx)
```

All agent files live under `agents/` because Astropods resolves the spec's
build context relative to the `astropods.yml` location.

## Deploy

```bash
ast push          # creates the blueprint in the registry
ast deploy        # deploy an instance; you'll be prompted for PACK_TOKEN
```

Set `PACK_TOKEN` to a valid bearer token accepted by the CampusHub
`/api/insights/pack` endpoint, and `PACK_ENDPOINT` to the deployment's URL
(default: `https://campushub-2.onrender.com/api/insights/pack`).

## Alternative: in-app AI (no Astropods)

The dashboard's `/dashboard/ai-insights` pages use the same metrics pack
directly through the Vercel AI SDK (`POST /api/insights`,
`/api/insights/chat`) — that path is fully implemented and does not require
an Astropods account.
