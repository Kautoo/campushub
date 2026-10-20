# CampusHub — University Commerce & Society Fundraising Platform

CampusHub is an editorial campus commerce and fundraising platform for university communities. It connects verified student societies with university students for merchandise sales (such as laboratory coats, society hoodies, and technical equipment) and transparent crowdfunding for student-led initiatives (such as Formula Student racing, community health drives, and aerospace payloads).

---

## 🎨 Implemented Screens & Feature Map

All 8 screens from the Stitch design specifications are fully implemented with responsive layouts, editorial typography, and interactive state management:

| Route | Screen Name | Description & Interactive Capabilities |
|---|---|---|
| **`/`** | **Good finds. Greater purpose.** (Homepage) | Hero section with verified society badges, Curated Batch Drop #04 product grid, active campaign spread, campus collection schedule, and trust principles. |
| **`/shop`** | **Shop Essentials & Society Gear** | Full store catalog with multi-category filters (Lab & Clinical, Outerwear, Stationery), student society selector, in-stock filter, sort dropdown, and quick add-to-bag. |
| **`/shop/[id]`** | **Product Detail Page** | High-resolution image gallery, standard unisex size selectors with stock indicators, society impact commitment callout, technical specifications table, and instant PayPal checkout. |
| **`/campaigns`** | **Student-Led Campaigns** | Crowdfunding directory with Landmark Hero initiative, progress bars (% funded, backers, days left), itemized student treasury ledger breakdown, and cause filters. |
| **`/campaigns/[id]`** | **Campaign Detail Page** | Full project narrative story, itemized budget ledger, team engineering updates, contribution tier selection ($15, $45, $120, or custom), and direct PayPal backing. |
| **`/checkout`** / **`/bag`** | **Bag & PayPal Sandbox Checkout** | Interactive shopping bag with item quantity controls, campus locker pickup vs mailbox delivery selector, student ID verification, optional campaign round-up add-on, official PayPal Sandbox checkout gateway (with 1-click test simulation), and digital pickup locker PIN code receipt generation. |
| **`/account`** | **Student Account & Orders** | Verified student profile (Alex Rivera • STU-2024-9104), active order history with live status badges (`Ready for Pickup`, `Dispatched`, `Delivered`), smart locker QR pass codes, backed campaign milestones, and campus pickup locker directory. |
| **`/organizer`** | **Organizer Workspace & Dashboard** | Society management portal with key financial metrics ($14,280 sales, $8,450 campaigns), student orders fulfillment table with "Mark Collected" toggles, merchandise stock inventory controls, and connected PayPal Sandbox business account payouts. |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16.4.2 (App Router with Turbopack, Partial Prerendering, and Server Actions)
- **Language:** TypeScript 5 (Strict Mode enabled)
- **Styling:** Tailwind CSS v4, shadcn/ui primitive architecture, and custom CSS design tokens
- **Typography:** Newsreader (Editorial Serif) paired with Geist Sans (Modern High-Density UI)
- **Icons:** Lucide React
- **Payments:** PayPal Orders API v2 (with server-side token creation, capture, and sandbox testing)
- **State Management:** React Context (`BagContext`) with persistent `localStorage` synchronization
- **Validation:** Zod schemas for environment variables and API contracts
- **Database & Auth Foundation:** Supabase client utilities (`@supabase/ssr`, `@supabase/supabase-js`)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+ (v24 recommended)
- **npm**: v10+

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

For PayPal Sandbox testing:
```ini
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```
*(Note: If live sandbox credentials are not yet configured, CampusHub includes an instant **1-Click Sandbox Test Checkout** simulation mode that uses the exact same Orders API contract for seamless offline testing!)*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Operational Scripts

- `npm run dev` — Starts local development server with Turbopack.
- `npm run build` — Compiles optimized production build with static prerendering.
- `npm run start` — Runs the compiled production server.
- `npm run lint` — Runs ESLint checks across all TypeScript and React files.
- `npm run typecheck` — Validates TypeScript contracts without emitting output (`tsc --noEmit`).

---

## 🔒 Security & Architecture Baseline

1. **Strict Server Boundary:** Server-only modules (`src/server/paypal.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`) enforce `import 'server-only'` to guarantee credentials never leak into client bundles.
2. **Server-Side Order Creation & Capture:** All payment computations occur server-side through `/api/paypal/create-order` and `/api/paypal/capture-order` to eliminate client-side price tampering.
3. **Idempotent Requests:** All PayPal POST requests utilize unique `PayPal-Request-Id` headers.
4. **Student Treasury Verification:** Zero-markup direct payouts to verified student society accounts.
