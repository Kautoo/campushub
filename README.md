# CampusHub 2.0

AI-powered campus events & commerce SaaS: ticketing, storefront, PayPal
payments, and **grounded** AI insights — one Next.js app, one Render Postgres
database, deployed on Render.

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 16 (App Router, standalone output), React 19 |
| UI | Tailwind CSS v4, HeroUI v3, Magic UI effects, Material Symbols |
| Data | Render Postgres (vanilla Postgres, `pg` pool, repo-layer org scoping) |
| Auth | Auth.js v5 (next-auth beta) — credentials + encrypted JWT sessions, scrypt password hashes |
| Files | DB-backed file store (`files` table) with HMAC-signed download routes |
| Payments | PayPal Orders v2 (`@paypal/paypal-server-sdk`, `@paypal/react-paypal-js`), webhooks with signature verification |
| AI | Vercel AI SDK (`ai`) over an OpenAI-compatible gateway (default model `glm-5.3-flash`) |
| Tables | AG Grid Community (MIT) |
| Timeline | Bryntum Scheduler Community edition (MIT) — the paid `@bryntum/scheduler` npm package is a license-gated placeholder; `BRYNTUM_LICENSE_KEY` is reserved for an upgrade to the licensed build |
| Sponsor AI | Channel3 (market discovery), Astropods (declarative analyst agent spec) |

## Quick start (local)

```bash
npm ci
createdb campushub_render
psql -d campushub_render -f db/schema.sql -f db/seed.sql
cp .env.example .env.local    # fill in values below
npm run dev                   # http://localhost:3000
```

## Development & testing

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build (standalone output)
npm run lint     # eslint (0 errors expected)
npx tsc --noEmit # typecheck (0 errors expected)
npm test         # all suites: unit, db-integration, api-e2e
```

All suites green as of the last audit: **unit 17/17, db-integration 13/13,
api-e2e 15/15**.

Test suites (all run against real Postgres, no mocks):

- `tests/unit.test.mjs` — validation schemas, money/permission helpers.
  Requires no database.
- `tests/db-integration.test.mjs` — `place_order` RPC fee/stock math,
  repo-layer org scoping, seed sanity. Connects to a local Postgres
  (default `postgres://postgres:postgres@127.0.0.1:5432/campushub_render`,
  override with `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`);
  every mutating test rolls back its transaction.
- `tests/api-e2e.test.mjs` — HTTP contract against a production-build
  standalone server on `127.0.0.1:3400` (booted by the suite; see the file
  header): route statuses, honest degradation when PayPal/AI keys are
  unset, auth redirects.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **yes** | Postgres connection string (Render Postgres in production, any local Postgres for dev) |
| `AUTH_SECRET` | **yes** | Auth.js secret — signs/encrypts session cookies and report-file tokens |
| `AUTH_TRUST_HOST` | no (set `true` on Render) | needed when the app runs behind a proxy |
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

## Database setup (Render Postgres / any Postgres)

1. **Render**: the blueprint (`render.yaml`) creates the `campushub-db`
   Postgres service and wires `DATABASE_URL` into the web service
   automatically. **Local**: any Postgres instance works.
2. Apply the schema and (optionally) the demo seed with psql against your
   connection string:
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   psql "$DATABASE_URL" -f db/seed.sql
   ```
   `db/seed.sql` creates the "Tech Society" demo org: 6 events, 12 tiers,
   12 products, 40 orders, transactions, notifications, and demo users.
3. **Demo login**: sign in at `/login` with `owner@campushub.test` /
   `admin@campushub.test` / `staff@campushub.test` — password
   `campushub-demo` (dev/demo affordance; production users register
   normally at `/register`, which creates their own org).

**Org scoping model**: every table carries `org_id`; scoping is enforced by
the repo layer (`lib/db/repo.ts`), which resolves the caller's org
memberships from the Auth.js session and appends `org_id = ANY($1::uuid[])`
to every query. Anonymous visitors can read published events and active
products only (public storefront paths). PayPal webhooks and report exports
write directly server-side (no user session), mirroring the old
service-role behavior.

## PayPal setup

1. [developer.paypal.com](https://developer.paypal.com) → create a **Sandbox**
   app → copy client id/secret.
2. Add a webhook: URL `https://<your-domain>/api/paypal/webhook`, events:
   `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`,
   `PAYMENT.CAPTURE.REFUNDED` → copy the webhook id into `PAYPAL_WEBHOOK_ID`.
3. Checkout flow: `/api/checkout` validates items server-side (stock, price,
   via the `place_order` SQL function) → `/api/paypal/create-order` builds
   the PayPal order from the **DB total** → `/api/paypal/capture` verifies
   `COMPLETED` before marking the order paid, records a verified
   transaction, and confirms ticket registrations.
4. Webhooks verify the transmission signature against `PAYPAL_WEBHOOK_ID`,
   dedupe by `provider_event_id` (unique index), and are idempotent. A
   tampered payload returns 400 and stores nothing.

> If the sandbox rejects MYR for your account, set `PAYPAL_CURRENCY=USD`;
> the code is currency-agnostic (per-org currency column already exists).

## AI insights (grounded)

- `POST /api/insights/pack` — builds the metrics pack from real aggregates
  (revenue by day, top products, tier sell-through, refund totals, low
  stock). Session-authenticated, org-scoped.
- `POST /api/insights` — one-click summary/anomaly/recommendation cards.
- `POST /api/insights/chat` — streaming "Ask your data"; every turn
  re-grounds the model with a fresh pack.
- System prompt forbids numbers outside the pack; amounts are integer cents.
- Persisted in `ai_insights` for audit.

## Reports / file exports

`POST /api/reports/export` generates a CSV for your org, stores it in the
`files` table (DB-backed file store — no external storage service), and
returns a token-signed download URL (`/api/files/<id>?token=…`, 24h expiry)
that the reports page lists. Tampered or expired tokens get a 403.

## Sponsor integrations — what's live vs structured

| Sponsor | Status |
|---|---|
| PayPal | Fully implemented (server-side verification + idempotent webhooks). End-to-end sandbox payment requires your sandbox buyer — documented above. |
| Render Postgres | Fully implemented — `pg` pool, repo-layer org scoping, `place_order` SQL function, DB-backed file store. |
| AG Grid Community | Live — all dashboard tables. |
| Bryntum Scheduler | Implemented on the Events page "Timeline" tab with real event data via the Community (MIT) edition. Upgrading to the licensed build = swap the package and set `BRYNTUM_LICENSE_KEY`; the trial banner hides when a license env is present. |
| Channel3 | Implemented behind `CHANNEL3_API_KEY`; widget hidden without it. Live-tested only with a key. |
| Astropods | Declarative agent spec at `agents/campushub-analyst.yaml` (model, knowledge = metrics-pack endpoint, strict grounding guardrails). Deploying requires an Astropods account + `ASTROPODS_API_KEY`; the Vercel AI SDK path above is the working implementation. |

## Deploy to Render

1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo (uses `render.yaml`). The
   blueprint creates the `campushub-db` Postgres service (basic-1gb) and
   wires `DATABASE_URL` into the web service.
3. Fill the `sync:false` env vars in the dashboard (`AUTH_SECRET`, PayPal,
   AI, optional sponsor keys).
4. Apply the schema to the Render database once (Get the connection string
   from the Render dashboard → database → Connections):
   ```bash
   psql "<render-connection-string>" -f db/schema.sql -f db/seed.sql
   ```
5. Deploy — build `npm ci && npm run build`, start
   `node .next/standalone/server.js`, health check `/api/health`.
6. In PayPal, point the webhook at `https://<render-url>/api/paypal/webhook`.

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
                            reports/export, files/[id], auth/[...nextauth],
                            store-config, health
lib/db/                     pg pool + repo layer (org-scoped queries)
lib/auth/                   session context + scrypt password hashing
lib/files.ts                DB-backed file store + HMAC-signed URLs
auth.ts                     Auth.js v5 config (credentials, JWT sessions)
db/                         schema.sql + seed.sql (vanilla Postgres)
components/                 ui/, layout/, store/, grid/, charts/, workspaces/, magicui/
agents/                     Astropods agent spec
render.yaml                 Render blueprint (web service + Postgres database)
```

## Code quality notes

- **Typecheck & lint gates**: `npx tsc --noEmit` and `npm run lint` both
  pass with 0 errors. Client components avoid `setState` directly inside
  effect bodies (deferred via `requestAnimationFrame` or moved into
  callbacks) to satisfy the React Compiler purity rules.
- **Org scoping is application-enforced**: vanilla Postgres has no RLS
  context, so every repo query takes the caller's `orgIds` explicitly.
  Never add a query that trusts a client-supplied `org_id`.
- **Money is integer cents** (`*_cents` columns) with a per-org currency
  column; helpers live in `lib/money.ts`.
- **Honest degradation**: absent env keys disable features with visible
  notices — never fabricated data (see the sponsor table above).
