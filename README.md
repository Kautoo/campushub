# CampusHub

AI-powered campus events & commerce platform deployed at **`https://campushub.hyria.top`**:
multi-page student storefront, Bryntum Scheduler 8.0 venue timelines, AG Grid Community 36
operational ledgers, PayPal Orders v2 escrow payments, and custom grounded AI commerce
analytics — one Next.js app, one Render Postgres database.

## How CampusHub Uses PayPal and AI

**PayPal (developer platform, free sandbox environment)** — CampusHub runs a genuine end-to-end PayPal checkout:

- **`@paypal/paypal-server-sdk`** (server side, `lib/paypal.ts`): a PayPal `Client` pointed at `Environment.Sandbox` (a single `PAYPAL_ENV` flag switches to production later). Its `OrdersController` powers `POST /api/paypal/create-order` (builds the order from the shopper's cart) and `POST /api/paypal/capture` (captures the approved payment and writes the order into the Postgres ledger).
- **`@paypal/react-paypal-js`** (client side): renders the real **PayPal Buttons** (`PayPalScriptProvider` + `PayPalButtons`) on `/demo/checkout`. Button clicks call our server to create the sandbox order; on approval the browser hands control to the capture endpoint — a real browser-to-server PayPal round trip.
- **PayPal Webhooks + signature verification** (`/api/paypal/webhook`): receives async PayPal events, verifies the signature server-to-server, deduplicates by event ID, and reconciles order status, transactions, and organizer notifications — so payments stay truthful even if a shopper closes the tab.
- Every AI insight on the dashboard is grounded in revenue captured through these real sandbox PayPal orders.

**AI (models, SDKs, and services)**:

- **Vercel AI SDK (`ai` + `@ai-sdk/openai-compatible`)**: streams the conversational AI analyst responses token-by-token in the ChatGPT-style insights chat.
- **OpenAI-compatible LLMs (OpenAI, Groq, DeepSeek, OpenRouter, Together AI, local Ollama/vLLM)**: `lib/ai.ts` speaks the OpenAI chat-completions protocol, so the model is swappable purely via env (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) — no code changes to switch providers.
- **Grounded Commerce Analyst Engine (built in-house, `lib/ai.ts`)**: before any LLM call, the server assembles a strict "metrics pack" from live SQL aggregates (revenue by day, tier sell-through, refunds, low-stock items). The system prompt forbids the model from inventing numbers, and with no external AI key configured, a deterministic embedded engine answers directly from the pack. Result: the AI cannot hallucinate a revenue figure, and customer PII never enters the pack.
- **Channel3 (AI-powered market intelligence API, `lib/channel3.ts`)**: the "Market Radar" tab benchmarks campus merchandise pricing against real commercial retail prices so organizers can price student products competitively.

## Sponsor Integrations

- **Render**: full production hosting — the Next.js web service and the PostgreSQL database both run on Render, provisioned by the included Render Blueprint (`render.yaml`). Deploy it yourself via Render Dashboard → New → Blueprint → point at this repo.
- **Bryntum Scheduler Community (MIT)**: powers the drag-and-drop multi-venue event timeline.
- **AG Grid Community (MIT)**: powers the high-density operational data ledgers.

## Architecture

| Layer | Technology | Primary Role |
|---|---|---|
| App | Next.js 16 (App Router, standalone output), React 19 | Multi-page storefront + 12 organizer workspaces |
| UI | Tailwind CSS v4, HeroUI v3, Material Symbols | Dual-theme design system (`DESIGN.md` Collegiate / Nocturne) |
| Data | Render Postgres (`pg` pool, repo-layer org scoping) | Real-time atomic inventory & seat reservations via `place_order` RPC |
| Auth | Auth.js v5 (next-auth beta) — credentials + encrypted JWT | Role-based committee access control (Owner, Admin, Staff) |
| Files | DB-backed file store (`files` table) | HMAC-signed 24-hour audit report downloads |
| Payments | PayPal Orders v2 (`@paypal/paypal-server-sdk`, `@paypal/react-paypal-js`) | Atomic guest checkout, escrow capture & cryptographic HMAC webhooks |
| Scheduling | Bryntum Scheduler Community 8.0 (MIT) | Multi-venue timeline, Day/Week/Semester presets & drag-and-drop rescheduling |
| Tables | AG Grid Community 36 (MIT) | High-density ledgers for Events, Registrations, Products, Orders, Transactions & Members |
| AI Engine | Custom AI & Grounded Commerce Analyst (`lib/ai.ts`) | Real-time grounded commerce analytics with OpenAI/Groq/DeepSeek gateway support |
| Discovery | Channel3 Commercial Product Radar (`lib/channel3.ts`) | Collegiate retail benchmarking and competitor price comparisons |

## Multi-Page E-Commerce Storefront (`/demo/*`)

The storefront provides an authentic, consumer-grade shopping experience with
live multi-currency conversion (**MYR (RM)**, **USD ($)**, **SGD (S$)**, **EUR (€)**, **GBP (£)**):

- `/demo` — Storefront Home: 4-department directory, flagship event spotlight, featured pass tiers, interactive merch catalog, and platform architecture matrix.
- `/demo/events` — Campus Events Catalog: Full lineup of upcoming conferences, hackathons, and workshops with live capacity bars and tier perk chips.
- `/demo/events/[slug]` — Event Box Office: Detailed schedule and venue cards, sticky pass tier selector (`TierBuyButton`), and related events.
- `/demo/shop` — Official Merchandise Shop: Category filter pills, instant text search, price/inventory sorting, and member pricing.
- `/demo/products/[slug]` — Product Detail Page (PDP): High-resolution gallery, SKU badges, stock meters, and interactive `ProductBuyBox` with **Add to Bag** and **Buy Now with PayPal**.
- `/demo/societies` — Accredited Societies Directory: Campus club profiles with member counts, hosted events, and union accreditation badges.
- `/demo/cart` — Shopping Bag: Line-item management (`−`/`+` quantity steppers, item removal), pass vs. merch classification, fee transparency, and checkout link.
- `/demo/checkout` — 4-Step Express Checkout: 2-column receipt layout with buyer details, order items review, and PayPal Orders v2 capture.

## Live Storefront Sync & Multi-Device Live Preview

When organizers make changes in the dashboard:
1. **Immediate Cache Invalidation**: `app/actions/events.ts` and `app/actions/products.ts` invoke `revalidateTag("storefront")` and revalidate all `/demo/*` routes so edits to titles, prices, stock, dates, venues, or status appear on the storefront **immediately**.
2. **Full /demo Storefront Live Preview**: Both `EventModal` and `ProductModal` feature an interactive **Full Storefront Live Preview** with **Desktop (100%)**, **Tablet (768px)**, and **Mobile (375px)** device viewport switchers, letting organizers preview how their store looks in total view across all screen sizes.
3. **User-Isolated Preview Sessions**: Previews render in an isolated session scope (`/demo?preview=1`) showing that specific user's draft and catalog changes, while public visitors and other evaluators see the pristine, unmodified default template.
4. **Wix-Style In-Modal Card Preview**: Rapid single-card preview updating in real time as organizers edit titles, categories, pricing, and photo presets.
5. **One-Click Live View**: Every active row in AG Grid and the Bryntum inspector includes a direct `open_in_new` link to its live storefront page (`/demo/events/[slug]` or `/demo/products/[slug]`).

## Protected Master Showcase vs. Private Sandbox Architecture

CampusHub features an enterprise-grade multi-tenant workspace architecture:
1. **Protected Master Showcase (`Tech Society`)**: The default demo organization (`00000000-0000-4000-8000-000000000001`) is a read-only showcase populated with realistic conferences, hackathons, merchandise, and PayPal orders. Evaluators can explore all 12 workspaces, inspect Bryntum schedules, and review AG Grid ledgers without restrictions.
2. **Auto-Conversion on Edit Attempt**: Attempting to create or edit events or products in the master showcase automatically converts the session — a `Launching your private sandbox…` overlay appears, `createDemoSandbox()` provisions the private workspace, and the page reloads on the same route with the editor reopened (for New actions) or a `Private sandbox is live` notice. The server action guard remains as a backstop and rejects any showcase mutation that reaches the API.
3. **Auto-Cloned Private Sandboxes (`sandbox-xxxx`)**: Clones baseline events, tiers, and 12 products automatically, giving evaluators full unrestricted edit access (drag-and-drop in Bryntum, edit prices in AG Grid, add new events).
4. **Workspace Switcher & Showcase Indicator**: The top dashboard header displays a refined, non-intrusive Showcase Mode pill in the right utility actions area, keeping the primary breadcrumb clean (`[Organization] / [Page]`). Evaluators can also seamlessly switch back and forth between the Master Showcase (Read-Only) and their private Sandbox Workspace from the header dropdown.
5. **Security & Mutation Boundaries**: All write operations (products, events, ticket tiers, orders, registrations, members, and organization settings) are strictly guarded against showcase modification, with role-based authorization enforced server-side.
## Separated Personal Account & Organization Settings

Settings in `/dashboard/settings` are cleanly segmented into dedicated tabs:
- **Organization & Gateways (`/dashboard/settings?tab=organization`)**: Society profile, slug, public description, base currency, PayPal Orders v2 gateway toggles, and authorized committee member access rosters.
- **Personal Account Profile (`/dashboard/settings?tab=account`)**: Individual user display name, avatar icon presets, and session credentials.

## Executive CSV Audit Exports

Downloaded CSV reports (`/dashboard/reports`) feature executive formatting:
- **Microsoft Excel & Google Sheets Native**: Prepended with UTF-8 BOM (`\uFEFF`) to prevent character distortion.
- **Formatted Financials**: Outputs localized decimal currency (e.g. `RM 45.00`) alongside raw integer cents.
- **Human-Readable Dates**: Formatted as clean timestamps (`YYYY-MM-DD HH:mm:ss`) alongside local calendar dates.
- **Clean Status Columns**: Formatted uppercase labels for order fulfillment, audit verification, and gate check-in status.
## Grounded AI Commerce Analyst Studio

All commerce analysis on `/dashboard/ai-insights` is powered by the **CampusHub AI Commerce Analyst Engine** (`lib/ai.ts`):
- **Custom AI Providers Supported**: Connect any custom OpenAI-compatible endpoint (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) such as OpenAI, Groq, DeepSeek, OpenRouter, or local Ollama instances.
- **Zero-Key Embedded Grounding Engine**: If no external AI key is set, CampusHub executes an embedded grounded engine directly against your PostgreSQL metrics pack with zero external subscriptions required.
- **ChatGPT-Style Conversational Interface**: Modern chat experience with streaming responses, suggested query chips, copy actions, and a floating bottom tab bar (`AI Chat`, `Quick Briefs`, `Market Radar`, `Audit Ledger`).
- **Zero Hallucinations & Zero PII**: Every analysis is strictly grounded in live database aggregates (revenue by day, tier sell-through, refund totals, low-stock items). Customer personal data never enters the pack.
## Quick start (local)

```bash
npm ci
createdb campushub_render
psql -d campushub_render -f db/schema.sql -f db/seed.sql
cp .env.example .env.local
npm run dev                   # http://localhost:3000
```

### Demo Accounts

Sign in at `/login` with seeded credentials:
- **Owner**: `owner@campushub.test` · Password: `campushub-demo`
- **Admin**: `admin@campushub.test` · Password: `campushub-demo`
- **Staff**: `staff@campushub.test` · Password: `campushub-demo`

## Testing & Quality Gates

```bash
npx tsc --noEmit                                    # Typecheck (0 errors)
npm run lint                                        # ESLint (0 errors)
node --test tests/unit.test.mjs                     # 18/18 unit tests
node --test tests/db-integration.test.mjs           # 13/13 Postgres integration tests
npm test                                            # Full test suite (50/50 passed)
```

## License

Released under the [MIT License](LICENSE) — an OSI-approved open source license.
Third-party UI libraries used under their own MIT licenses: Bryntum Scheduler
Community and AG Grid Community.
