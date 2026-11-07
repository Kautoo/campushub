# CampusHub 2.0

AI-powered campus events & commerce SaaS: ticketing, storefront, PayPal
payments, and **grounded** AI insights — one Next.js app, one Supabase
project, deployed on Render.

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 16 (App Router, standalone output), React 19 |
| UI | Tailwind CSS v4, HeroUI v3, Magic UI effects, Material Symbols |
| Data | Supabase (Postgres + RLS, Auth, Storage) |
| Payments | PayPal Orders v2 (`@paypal/paypal-server-sdk`, `@paypal/react-paypal-js`), webhooks with signature verification |
| AI | Vercel AI SDK (`ai`) over an OpenAI-compatible gateway (default model `glm-5.3-flash`) |
| Tables | AG Grid Community (MIT) |
| Timeline | Bryntum Scheduler Community edition (MIT) — the paid `@bryntum/scheduler` npm package is a license-gated placeholder; `BRYNTUM_LICENSE_KEY` is reserved for an upgrade to the licensed build |
| Sponsor AI | Channel3 (market discovery), Astropods (declarative analyst agent spec) |

## Quick start (local)

```bash
npm ci
cp .env.example .env.local    # fill in values below
npm run dev                   # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **yes** | anon key (RLS applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes for webhooks/AI/export | service role (bypasses RLS) — server-only |
| `PAYPAL_ENV` | no (default `sandbox`) | `sandbox` \| `live` |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | yes for checkout | PayPal app credentials |
| `PAYPAL_CURRENCY` | no (default `MYR`) | falls back to USD if the sandbox account rejects MYR |
| `PAYPAL_WEBHOOK_ID` | yes for webhooks | from the PayPal developer dashboard webhook subscription |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | yes for checkout | same client id, exposed to the storefront buttons |
| `AI_BASE_URL` / `AI_API_KEY` | no | OpenAI-compatible gateway; without them the AI pages show a setup notice and generate nothing |
| `AI_MODEL` | no (default `glm-5.3-flash`) | model id for the gateway |
| `CHANNEL3_API_KEY` | no | market-discovery widget; hidden without it |
| `ASTROPODS_API_KEY` | no | Astropods agent deploy; structure ships regardless |
| `BRYNTUM_LICENSE_KEY` | no | Bryntum Scheduler license; without it the timeline runs in trial mode with a visible banner |

Missing keys never produce fake features: PayPal-less storefront disables
checkout with a notice; keyless AI shows setup instructions; Channel3 and
Bryntum degrade to hidden/trial honestly.

## Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → run `supabase/migrations/0001_init.sql` (schema, RLS,
   `place_order` RPC, storage buckets).
3. For demo data run `supabase/migrations/0002_demo.sql` (Tech Society org,
   6 events, 12 tiers, 12 products, 40 orders, transactions, notifications).
4. Register → your user automatically gets a profile + own organization
   (trigger `handle_new_user`). To attach the demo data instead, run:
   ```sql
   select public.join_demo_org();
   ```

**RLS model**: every table carries `org_id`; organizer reads/writes are
policies joining `org_members`. Anonymous visitors can read published events
and active products only. Webhooks/AI/report exports use the service-role
key server-side.

### Local schema verification (optional)

The migration was verified against a local Postgres 16 with a stub `auth`
schema (`auth.users` table + `auth.uid()` from `request.jwt.claim.sub`), the
Supabase roles (`anon`, `authenticated`, `service_role`), and a
`storage.foldername()` shim. Verified: seed counts, `place_order` atomic
stock decrement + fee math, RLS isolation (anon sees only published/active,
outsider writes rejected, member sees org data).

## PayPal setup

1. [developer.paypal.com](https://developer.paypal.com) → create a **Sandbox**
   app → copy client id/secret.
2. Add a webhook: URL `https://<your-domain>/api/paypal/webhook`, events:
   `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`,
   `PAYMENT.CAPTURE.REFUNDED` → copy the webhook id into `PAYPAL_WEBHOOK_ID`.
3. Checkout flow: `/api/checkout` validates items server-side (stock, price,
   via the `place_order` RPC) → `/api/paypal/create-order` builds the PayPal
   order from the **DB total** → `/api/paypal/capture` verifies `COMPLETED`
   before marking the order paid, records a verified transaction, and
   confirms ticket registrations.
4. Webhooks verify the transmission signature against `PAYPAL_WEBHOOK_ID`,
   dedupe by `provider_event_id` (unique index), and are idempotent. A
   tampered payload returns 400 and stores nothing.

> If the sandbox rejects MYR for your account, set `PAYPAL_CURRENCY=USD`;
> the code is currency-agnostic (per-org currency column already exists).

## AI insights (grounded)

- `POST /api/insights/pack` — builds the metrics pack from real aggregates
  (revenue by day, top products, tier sell-through, refund totals, low
  stock). Session-authenticated, RLS-scoped.
- `POST /api/insights` — one-click summary/anomaly/recommendation cards.
- `POST /api/insights/chat` — streaming "Ask your data"; every turn
  re-grounds the model with a fresh pack.
- System prompt forbids numbers outside the pack; amounts are integer cents.
- Persisted in `ai_insights` for audit.

## Sponsor integrations — what's live vs structured

| Sponsor | Status |
|---|---|
| PayPal | Fully implemented (server-side verification + idempotent webhooks). End-to-end sandbox payment requires your sandbox buyer — documented above. |
| AG Grid Community | Live — all dashboard tables. |
| Bryntum Scheduler | Implemented on the Events page "Timeline" tab with real event data via the Community (MIT) edition. Upgrading to the licensed build = swap the package and set `BRYNTUM_LICENSE_KEY`; the trial banner hides when a license env is present. |
| Channel3 | Implemented behind `CHANNEL3_API_KEY`; widget hidden without it. Live-tested only with a key. |
| Astropods | Declarative agent spec at `agents/campushub-analyst.yaml` (model, knowledge = metrics-pack endpoint, strict grounding guardrails). Deploying requires an Astropods account + `ASTROPODS_API_KEY`; the Vercel AI SDK path above is the working implementation. |

## Deploy to Render

1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo (uses `render.yaml`).
3. Fill the `sync:false` env vars in the dashboard (Supabase, PayPal, AI, optional sponsor keys).
4. Deploy — build `npm ci && npm run build`, start
   `node .next/standalone/server.js`, health check `/api/health`.
5. In PayPal, point the webhook at `https://<render-url>/api/paypal/webhook`.

## Project layout

```
app/(marketing)/            landing page
app/(store)/demo/           public storefront + guest checkout
app/(auth)/login|register   auth portal
app/(dashboard)/dashboard/  13 workspaces (overview, ai-insights, events,
                            registrations, products, orders, transactions,
                            members, notifications, reports, settings, help)
app/api/                    checkout, paypal/{create-order,capture,webhook},
                            insights/{,pack,chat}, channel3/search,
                            reports/export, store-config, health
lib/                        supabase clients, paypal, ai, metrics pack,
                            channel3, money, rbac, validation, nav
supabase/migrations/        0001_init.sql, 0002_demo.sql
components/                 ui/, layout/, store/, grid/, charts/, workspaces/, magicui/
agents/                     Astropods agent spec
render.yaml                 Render blueprint
```
