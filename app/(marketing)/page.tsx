"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { Marquee, BlurFade } from "@/components/magicui";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CenterHero } from "@/components/marketing/center-hero";
import { RevealHeading } from "@/components/marketing/reveal-heading";
import { StoryActs } from "@/components/marketing/story-acts";
import { StatWall, SectionBeat } from "@/components/marketing/premium-sections";
import { TryAiButton } from "@/components/marketing/cta-buttons";
import { Magnetic } from "@/components/marketing/magnetic";
import { InsightConversation } from "@/components/marketing/insight-conversation";
import HoverDotsLazy from "@/components/marketing/hover-dots-lazy";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/primitives";

const HERO_ICONS = [
  { name: "PayPal Orders v2", icon: "account_balance_wallet" },
  { name: "Render Postgres", icon: "database" },
  { name: "Bryntum Scheduler 8.0", icon: "view_timeline" },
  { name: "AG Grid Community 36", icon: "table_chart" },
  { name: "Grounded AI SDK", icon: "auto_awesome" },
  { name: "Next.js 16 App Router", icon: "code_blocks" },
];

const ARCHITECTURE_PILLARS = [
  {
    eyebrow: "01 · CONSUMER E-COMMERCE",
    title: "Multi-Page Student Storefront & Ticketing",
    badge: "Storefront 2.0",
    tone: "teal" as const,
    icon: "storefront",
    description:
      "Purpose-built e-commerce experience with dedicated pages for Campus Events, Pass Tiers, Official Merch Shop, Product Detail Pages (PDPs), Shopping Bag, and PayPal Guest Checkout.",
    specs: [
      "Dedicated /demo/events/[slug] & /demo/products/[slug] pages",
      "Persistent guest shopping bag combining passes & apparel",
      "Atomic stock & seat reservation via Postgres place_order RPC",
    ],
    primaryHref: "/demo",
    primaryLabel: "Open Storefront Home",
    secondaryHref: "/demo/shop",
    secondaryLabel: "Merch Shop",
  },
  {
    eyebrow: "02 · TEMPORAL SCHEDULING ENGINE",
    title: "Bryntum Scheduler 8.0 Timeline & Calendar",
    badge: "Bryntum 8.0",
    tone: "primary" as const,
    icon: "view_timeline",
    description:
      "Native CampusHub timeline and vertical calendar workspace for managing university lecture halls, labs, and society initiatives without spreadsheet conflicts.",
    specs: [
      "Group tracks dynamically by Campus Venue, Program Track, or Event",
      "Switch between Day, Week, Multi-Week & Semester horizon presets",
      "Drag-and-drop rescheduling, duration resize & native inspector drawer",
    ],
    primaryHref: "/dashboard/events",
    primaryLabel: "Launch Event Scheduler",
    secondaryHref: "/demo/events",
    secondaryLabel: "Public Events",
  },
  {
    eyebrow: "03 · ENTERPRISE DATA TABLES",
    title: "AG Grid Community 36 Operational Ledgers",
    badge: "AG Grid 36",
    tone: "success" as const,
    icon: "table_chart",
    description:
      "Standardized high-density data management tables across all 6 operational domains with instant column filtering, status filter pills, density controls, and CSV export.",
    specs: [
      "Events, Registrations, Products, Orders, Transactions & Members",
      "Real-time quick-filter search & semantic status count chips",
      "Tabular numerals, stock health meters & one-click CSV audit export",
    ],
    primaryHref: "/dashboard/orders",
    primaryLabel: "Inspect Orders AG Grid",
    secondaryHref: "/dashboard/products",
    secondaryLabel: "SKU Catalog",
  },
  {
    eyebrow: "04 · FINANCIAL ESCROW & AI",
    title: "PayPal Orders v2 & Zero-PII Grounded AI",
    badge: "Verified Escrow",
    tone: "teal" as const,
    icon: "account_balance_wallet",
    description:
      "End-to-end payment integrity paired with an autonomous commerce analyst that answers organizer questions strictly from live Postgres aggregates.",
    specs: [
      "Server-side PayPal Orders v2 capture & HMAC webhook verification",
      "24-hour HMAC-signed CSV report downloads stored in Postgres",
      "Zero-hallucination AI briefs & streaming chat grounded in live metrics",
    ],
    primaryHref: "/dashboard/ai-insights",
    primaryLabel: "Open AI Workspace",
    secondaryHref: "/dashboard/transactions",
    secondaryLabel: "Webhook Ledger",
  },
];

const STORY_ACTS = [
  {
    id: "act-launch",
    eyebrow: "Act I · Venue Scheduling & Pass Launch",
    title: "Schedule venues in Bryntum, publish tiers in seconds",
    body: "Allocate Main Hall or CS Labs on the interactive Bryntum timeline, configure Student, Standard, and VIP pass tiers with perks, and go live on the storefront immediately.",
    bullets: [
      "Multi-venue conflict visibility across Day, Week, and Semester views",
      "Drag-and-drop date adjustments persisted directly to Postgres",
      "Instant QR token generation for every confirmed attendee registration",
    ],
    icon: "confirmation_number",
  },
  {
    id: "act-orders",
    eyebrow: "Act II · Multi-Page Checkout & AG Grid Fulfillment",
    title: "Every ringgit captured, verified, and reconciled",
    body: "Students shop event passes and society merchandise in a single cart. PayPal Orders v2 captures funds while organizers track fulfillment and webhook status in AG Grid.",
    bullets: [
      "Atomic place_order Postgres function prevents overselling on drops",
      "Cryptographic PayPal webhook verification with idempotent deduplication",
      "Slide-over order inspector and one-click CSV exports for bursary audits",
    ],
    icon: "receipt_long",
  },
  {
    id: "act-ai",
    eyebrow: "Act III · Grounded Commerce Intelligence",
    title: "AI that cites your real ledger — never invented figures",
    body: "Each AI summary, anomaly scan, and chat turn builds a fresh metrics pack from Postgres (daily revenue, tier sell-through, refunds, low stock) with zero student PII.",
    bullets: [
      "Strict system contract forbids citing numbers outside the live pack",
      "Proactively flags low-stock SKUs and top-converting ticket tiers",
      "Auditable insight history persisted per organization",
    ],
    icon: "auto_awesome",
  },
];

const FEATURES = [
  {
    icon: "view_timeline",
    title: "Bryntum Scheduler 8.0",
    body: "Custom-themed horizontal timelines and vertical calendar schedules with venue grouping, zoom presets, and drag-and-drop rescheduling.",
  },
  {
    icon: "table_chart",
    title: "AG Grid Community 36",
    body: "Native CampusHub data tables for Events, Registrations, Products, Orders, Transactions, and Members with quick-filter search and CSV export.",
  },
  {
    icon: "storefront",
    title: "Multi-Page Storefront",
    body: "Dedicated consumer routes for Events (/demo/events), Merch Shop (/demo/shop), Product Details, Shopping Bag (/demo/cart), and Checkout.",
  },
  {
    icon: "account_balance_wallet",
    title: "PayPal Orders v2 & Webhooks",
    body: "Server-side order total calculation, COMPLETED capture verification, and cryptographic webhook signature validation.",
  },
  {
    icon: "auto_awesome",
    title: "Grounded AI & Astropods",
    body: "One-click executive summaries, anomaly scans, streaming data chat, and a deployable Astropods analyst blueprint.",
  },
  {
    icon: "shield_person",
    title: "Multi-Org RBAC & File Vault",
    body: "Application-enforced org_id scoping across Owner, Admin, and Staff roles, plus HMAC-signed 24h CSV report archives.",
  },
];

const STATS = [
  { label: "Settled seed volume", value: 2924, money: true, icon: "payments" },
  { label: "Event passes sold", value: 293, icon: "confirmation_number" },
  { label: "Active merch SKUs", value: 12, icon: "inventory_2" },
  { label: "Verified orders", value: 34, icon: "receipt_long" },
];

const PRICING = [
  {
    name: "Student Society",
    tagline: "For clubs, academic societies, and orientation committees.",
    price: "RM 0",
    per: " / semester + 2.9% + RM 0.50 gateway fee",
    highlight: false,
    cta: "Start free workspace",
    features: [
      "Unlimited published events & pass tiers",
      "Multi-page storefront & guest cart",
      "AG Grid Community ledgers & CSV export",
      "Up to 5 committee members (Owner/Admin/Staff)",
    ],
  },
  {
    name: "Council & Hackathon Pro",
    tagline: "For flagship hackathons, varsity councils, and high-volume merch drops.",
    price: "RM 149",
    per: " / semester + PayPal standard rates",
    highlight: true,
    cta: "Launch Pro workspace",
    features: [
      "Everything in Student Society",
      "Bryntum Scheduler multi-venue timeline & calendar views",
      "Grounded AI Commerce Intelligence & streaming chat",
      "Channel3 market discovery & unlimited committee seats",
    ],
  },
  {
    name: "University Bursary Enterprise",
    tagline: "For student affairs deanships and multi-faculty governance.",
    price: "Custom",
    per: " · institutional SLA",
    highlight: false,
    cta: "Onboard university",
    features: [
      "Dedicated Render Postgres instance & custom domain",
      "Automated bursary settlement exports & webhook auditing",
      "Astropods autonomous analyst deployment",
      "Priority campus onboarding & engineering support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background">
      <SiteNav />

      {/* ACT I — Hero */}
      <CenterHero techIcons={HERO_ICONS} />

      {/* Technology Proof Band */}
      <section
        className="border-y border-outline-variant/60 bg-surface-lowest py-4"
        aria-label="Built with"
      >
        <Marquee pauseOnHover className="[--duration:22s]">
          {[
            "PayPal Orders v2",
            "Render Postgres",
            "Bryntum Scheduler 8.0",
            "AG Grid Community 36",
            "Vercel AI SDK",
            "Channel3 Commerce",
            "Astropods Agent",
            "Next.js 16 App Router",
          ].map((n) => (
            <span
              key={n}
              className="text-on-surface-variant mx-8 flex items-center gap-2 whitespace-nowrap text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[15px] text-secondary">
                verified
              </span>
              {n}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ACT II — Complete Service Architecture Breakdown */}
      <section
        id="architecture"
        className="mx-auto max-w-7xl px-4 py-20 lg:px-8 space-y-10"
      >
        <BlurFade>
          <SectionHeader
            icon="hub"
            eyebrow="Service & Technology Architecture"
            title="Purpose-Built Systems for Every Layer of Campus Commerce"
            subtitle="Explore how CampusHub 2.0 separates consumer e-commerce, temporal event scheduling (Bryntum), tabular financial management (AG Grid), and grounded AI into one cohesive platform."
          />
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ARCHITECTURE_PILLARS.map((pillar, idx) => (
            <BlurFade key={pillar.title} delay={idx * 0.05}>
              <article className="h-full rounded-2xl border border-outline-variant/55 bg-surface-lowest p-6 sm:p-7 shadow-xs hover:border-secondary/50 transition-all flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-label-sm font-mono font-bold uppercase tracking-wider text-secondary">
                      {pillar.eyebrow}
                    </span>
                    <Badge tone={pillar.tone} icon={pillar.icon}>
                      {pillar.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface">
                      {pillar.title}
                    </h3>
                    <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-outline-variant/40">
                    {pillar.specs.map((spec) => (
                      <li
                        key={spec}
                        className="flex items-start gap-2.5 text-body-sm text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-outline-variant/35">
                  <Link
                    href={pillar.primaryHref}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all"
                  >
                    <span>{pillar.primaryLabel}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </Link>
                  <Link
                    href={pillar.secondaryHref}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-low px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span>{pillar.secondaryLabel}</span>
                  </Link>
                </div>
              </article>
            </BlurFade>
          ))}
        </div>
      </section>

      <SectionBeat />

      {/* ACT III — Live Interactive Console Preview */}
      <section id="story" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <BlurFade>
          <SectionHeader
            icon="space_dashboard"
            eyebrow="Live Organizer Workspace"
            title="One Dashboard, Every Ringgit Accounted For"
            subtitle="Orders, event passes, settlement velocity, and SKU stock in one view — rendered with the actual CampusHub 2.0 components and Tech Society seed data."
            actions={
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all"
              >
                <span>Open Full Console</span>
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
              </Link>
            }
          />
        </BlurFade>
        <BlurFade delay={0.1}>
          <div className="mt-8 w-full rounded-3xl bg-surface-lowest shadow-xl overflow-hidden border border-outline-variant/60">
            {/* Browser Chrome Top Bar */}
            <div className="h-12 bg-surface-low px-5 flex items-center justify-between border-b border-outline-variant/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="ml-3 text-label-sm text-on-surface-variant font-mono hidden sm:inline">
                  campushub.edu/dashboard · Tech Society Workspace
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/events"
                  className="px-2.5 py-1 rounded-md bg-surface-lowest border border-outline-variant/50 text-on-surface text-[11px] font-semibold hover:border-secondary"
                >
                  Bryntum Timeline →
                </Link>
                <Link
                  href="/demo"
                  className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-semibold"
                >
                  Public Storefront →
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 bg-surface">
              <DashboardPreview />
            </div>
          </div>
        </BlurFade>
      </section>

      <SectionBeat />

      {/* ACT IV — Scroll Story */}
      <section className="mx-auto max-w-6xl px-4 pb-20 lg:px-8">
        <BlurFade>
          <p className="font-mono text-label-sm text-secondary uppercase tracking-[0.2em] font-bold">
            End-to-End Operational Flow
          </p>
          <RevealHeading
            text="From launch week to restock day."
            accentWord="restock"
            className="text-display text-on-surface mt-2 max-w-2xl"
          />
        </BlurFade>
        <div className="mt-14">
          <StoryActs acts={STORY_ACTS} />
        </div>
      </section>

      <SectionBeat />

      {/* ACT V — Feature Bento + Stat Wall */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-20 lg:px-8">
        <BlurFade>
          <RevealHeading
            text="Everything a society needs"
            className="text-display text-on-surface"
          />
          <p className="text-on-surface-variant mt-2 max-w-xl text-body-lg">
            One codebase, one login, one source of truth for campus events,
            merchandise, and bursary compliance.
          </p>
        </BlurFade>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <BlurFade key={f.title} delay={i * 0.04}>
              <article className="card-lift h-full rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs">
                <IconTile icon={f.icon} tone="teal" />
                <h3 className="text-on-surface mt-4 text-headline-sm font-bold">
                  {f.title}
                </h3>
                <p className="text-on-surface-variant mt-2 text-body-md leading-relaxed">
                  {f.body}
                </p>
              </article>
            </BlurFade>
          ))}
        </div>

        <div className="mt-14">
          <StatWall stats={STATS} />
        </div>
        <p className="text-on-surface-variant mt-3 text-center text-xs">
          Figures computed from the seeded Tech Society Postgres workspace.
        </p>
      </section>

      {/* ACT VI — Grounded AI Showcase */}
      <section className="relative overflow-hidden border-y border-outline-variant/60 bg-surface-low py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge tone="teal" icon="verified">
              Grounded AI — Zero Fabricated Numbers
            </Badge>
            <RevealHeading
              text="Ask your data anything."
              accentWord="anything."
              className="text-display text-on-surface mt-4"
            />
            <p className="text-on-surface-variant mt-4 text-body-lg leading-relaxed">
              Every AI prompt builds a fresh metrics pack from your Postgres
              database — daily settlement revenue, sell-through per ticket tier,
              refund totals, and low-stock SKUs — and is strictly forbidden from
              inventing figures outside that pack.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <TryAiButton />
              <Link
                href="/dashboard/ai-insights"
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-lowest px-5 text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                <span>Open AI Workspace</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
          <div className="relative">
            <InsightConversation />
            <div className="mt-4 flex justify-end gap-2">
              <Badge tone="teal">glm-5.3-flash</Badge>
              <Badge tone="neutral">verified Postgres aggregates</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ACT VII — Transparent Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <BlurFade>
          <RevealHeading
            text="Transparent Campus Pricing"
            className="text-display text-on-surface text-center"
          />
          <p className="text-on-surface-variant mt-2 text-center text-body-lg">
            Start free for student clubs. Upgrade for multi-venue hackathons and
            university-wide bursary governance.
          </p>
        </BlurFade>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PRICING.map((p, i) => (
            <BlurFade key={p.name} delay={i * 0.06}>
              <article
                className={
                  "card-lift relative flex h-full flex-col rounded-2xl border p-7 shadow-xs " +
                  (p.highlight
                    ? "border-secondary bg-surface-lowest ring-2 ring-secondary/30"
                    : "border-outline-variant/60 bg-surface-lowest")
                }
              >
                {p.highlight ? (
                  <span className="absolute -top-3 left-7">
                    <Badge tone="teal" icon="verified">
                      Most Popular
                    </Badge>
                  </span>
                ) : null}
                <h3 className="text-headline-md font-bold text-on-surface">
                  {p.name}
                </h3>
                <p className="text-on-surface-variant mt-1 text-body-sm">
                  {p.tagline}
                </p>
                <p className="mt-5 tabular-nums">
                  <span className="text-display font-bold text-primary">
                    {p.price}
                  </span>
                  <span className="text-on-surface-variant text-body-sm block mt-0.5">
                    {p.per}
                  </span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="text-on-surface flex items-start gap-2.5 text-body-sm"
                    >
                      <span className="material-symbols-outlined mt-0.5 text-[16px] text-secondary">
                        check_circle
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-7">
                  <Button
                    variant={p.highlight ? "primary" : "outline"}
                    className="btn-step h-11 w-full rounded-full text-label-lg font-semibold"
                  >
                    {p.cta}
                  </Button>
                </Link>
              </article>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* FINALE */}
      <section className="relative overflow-hidden py-24 border-t border-outline-variant/50">
        <div aria-hidden className="absolute inset-0">
          <HoverDotsLazy />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[min(680px,120vw)] -translate-x-1/2 opacity-20 dark:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--st-gradient-a) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <RevealHeading
            text="Your campus, one hub."
            accentWord="one"
            className="text-display text-on-surface"
          />
          <p className="text-on-surface-variant mx-auto mt-4 max-w-xl text-body-lg leading-relaxed">
            Explore the multi-page student storefront or sign in to the
            seeded Tech Society organizer workspace right now.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Magnetic>
              <Link
                href="/register"
                className="btn-step focus-aura bg-primary text-on-primary inline-flex h-12 items-center rounded-full px-8 text-label-lg font-semibold shadow-lg hover:opacity-90"
              >
                Create your workspace
              </Link>
            </Magnetic>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-lowest px-7 text-label-lg font-semibold text-on-surface hover:bg-surface-low transition-colors"
            >
              <span>Browse Demo Storefront</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
          <p className="text-on-surface-variant mt-5 text-body-sm">
            Free Student Society tier · Seeded demo workspace included
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
