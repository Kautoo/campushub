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

const ARCHITECTURE_PILLARS = [
  {
    step: "01",
    title: "Student Storefront",
    badge: "E-Commerce",
    icon: "storefront",
    summary:
      "Multi-page campus shop for event passes and licensed club merch with live currency switching and guest cart.",
    href: "/demo",
    cta: "Explore Storefront →",
  },
  {
    step: "02",
    title: "Venue Timeline",
    badge: "Bryntum 8.0",
    icon: "view_timeline",
    summary:
      "Visual multi-venue event scheduler with Day, Week, and Semester calendar presets and drag-and-drop rescheduling.",
    href: "/dashboard/events",
    cta: "Open Scheduler →",
  },
  {
    step: "03",
    title: "Commerce Ledgers",
    badge: "AG Grid 36",
    icon: "table_chart",
    summary:
      "High-density data tables across Events, Registrations, Products, Orders, and Transactions with instant CSV export.",
    href: "/dashboard/orders",
    cta: "View Ledgers →",
  },
  {
    step: "04",
    title: "PayPal & Grounded AI",
    badge: "Verified",
    icon: "auto_awesome",
    summary:
      "PayPal Orders v2 escrow capture paired with an AI analyst grounded strictly in live Postgres metrics.",
    href: "/dashboard/ai-insights",
    cta: "Explore AI →",
  },
];

const STORY_ACTS = [
  {
    id: "act-launch",
    eyebrow: "Schedule & Launch",
    title: "Schedule venues in Bryntum, publish pass tiers in seconds",
    body: "Assign lecture halls or labs on the interactive Bryntum timeline, configure Student, Standard, and VIP pass tiers with perks, and publish directly to the student storefront.",
    bullets: [
      "Conflict-free venue scheduling across Day, Week, and Semester views",
      "Drag-and-drop date changes saved directly to Postgres",
      "Instant QR pass token issued for every confirmed attendee",
    ],
    icon: "confirmation_number",
  },
  {
    id: "act-orders",
    eyebrow: "Checkout & Fulfillment",
    title: "Every ringgit captured, verified, and reconciled in AG Grid",
    body: "Students combine event passes and club merchandise in one shopping bag. PayPal Orders v2 settles payments while organizers manage fulfillment and webhooks in AG Grid.",
    bullets: [
      "Atomic Postgres stock reservation prevents overselling on drops",
      "Cryptographic PayPal webhook verification with deduplication",
      "Slide-over order inspector and one-click CSV exports for bursary audits",
    ],
    icon: "receipt_long",
  },
  {
    id: "act-ai",
    eyebrow: "Grounded Intelligence",
    title: "AI that cites your real ledger — never invented figures",
    body: "Every AI brief, anomaly scan, and chat turn builds a fresh metrics pack from your database (daily revenue, tier sell-through, refunds, low stock) with zero student PII.",
    bullets: [
      "Strict grounding contract forbids citing numbers outside your live data",
      "Proactively surfaces low-stock SKUs and fastest-selling pass tiers",
      "Full audit trail of generated insights stored per organization",
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
    body: "Dedicated buyer pages for Events, Merch Shop, Product Details, Shopping Bag, and Express Checkout with currency switching.",
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

const TECH_MARQUEE = [
  { name: "PayPal Orders v2", icon: "account_balance_wallet" },
  { name: "Render Cloud Platform", icon: "cloud" },
  { name: "Render Postgres DB", icon: "database" },
  { name: "Bryntum Scheduler 8.0", icon: "calendar_month" },
  { name: "AG Grid Community 36", icon: "table_chart" },
  { name: "Astropods Agent Engine", icon: "smart_toy" },
  { name: "Channel3 Market Radar", icon: "travel_explore" },
  { name: "Next.js 16 App Router", icon: "layers" },
  { name: "Tailwind CSS v4 & HeroUI", icon: "palette" },
];

const PRICING = [
  {
    name: "Student Society",
    tagline: "For clubs, academic societies, and orientation committees.",
    price: "RM 0",
    per: " / semester + 2.9% + RM 0.50 gateway fee",
    highlight: false,
    cta: "Start free workspace",
    comingSoon: false,
    badge: null,
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
    cta: "Prototype · Coming Soon",
    comingSoon: true,
    badge: "Prototype · Coming Soon",
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
    comingSoon: false,
    badge: null,
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

      {/* ACT I — Centered Hero */}
      <CenterHero />

      {/* Technology Proof Band */}
      <section
        className="border-y border-outline-variant/60 bg-surface-lowest py-4"
        aria-label="Built with"
      >
        <Marquee pauseOnHover className="[--duration:24s]">
          {TECH_MARQUEE.map((tech) => (
            <span
              key={tech.name}
              className="text-on-surface mx-6 flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold rounded-full bg-surface-low/80 border border-outline-variant/45 px-3.5 py-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px] text-secondary">
                {tech.icon}
              </span>
              <span>{tech.name}</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ACT II — Simplified 4-Column Purpose-Built Systems Overview */}
      <section
        id="architecture"
        className="mx-auto max-w-7xl px-4 py-20 lg:px-8 space-y-8"
      >
        <BlurFade>
          <SectionHeader
            icon="hub"
            eyebrow="Platform Architecture"
            title="Purpose-Built Systems for Every Layer of Campus Commerce"
            subtitle="Four specialized modules working together across student shopping, event scheduling, data management, and financial intelligence."
          />
        </BlurFade>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ARCHITECTURE_PILLARS.map((pillar, idx) => (
            <BlurFade key={pillar.title} delay={idx * 0.05}>
              <Link
                href={pillar.href}
                className="group h-full rounded-2xl border border-outline-variant/55 bg-surface-lowest p-6 shadow-xs hover:border-secondary/50 hover:shadow-md transition-all flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        {pillar.icon}
                      </span>
                    </div>
                    <Badge tone="teal">{pillar.badge}</Badge>
                  </div>

                  <div>
                    <span className="font-mono text-[11px] font-bold text-secondary">
                      STEP {pillar.step}
                    </span>
                    <h3 className="text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors mt-0.5">
                      {pillar.title}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                      {pillar.summary}
                    </p>
                  </div>
                </div>

                <span className="text-label-md font-semibold text-secondary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  {pillar.cta}
                </span>
              </Link>
            </BlurFade>
          ))}
        </div>
      </section>

      <SectionBeat />

      {/* ACT III — 1:1 Live Organizer Workspace Preview */}
      <section id="story" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <BlurFade>
          <SectionHeader
            icon="space_dashboard"
            eyebrow="Live Organizer Workspace"
            title="One Dashboard, Every Ringgit Accounted For"
            subtitle="The exact Executive Overview console your committee uses daily — rendered live with Tech Society seed metrics."
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
                  Events &amp; Timeline →
                </Link>
                <Link
                  href="/demo"
                  className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container text-[11px] font-semibold"
                >
                  Student Storefront →
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

      {/* ACT IV — Improved End-to-End Operational Flow */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 space-y-10">
        <BlurFade>
          <SectionHeader
            icon="route"
            eyebrow="End-to-End Operational Flow"
            title="From Venue Scheduling to Restock Day"
            subtitle="See how an event moves from Bryntum timeline planning to student checkout, AG Grid fulfillment, and grounded AI review."
          />
        </BlurFade>
        <StoryActs acts={STORY_ACTS} />
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

      {/* ACT VI — Grounded AI Showcase (No model identifier badge) */}
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
              <Badge tone="teal" icon="verified">
                Verified Postgres Aggregates Only
              </Badge>
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
                {p.badge ? (
                  <span className="absolute -top-3 left-7">
                    <Badge
                      tone={p.comingSoon ? "warning" : "teal"}
                      icon={p.comingSoon ? "schedule" : "verified"}
                    >
                      {p.badge}
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
                {p.comingSoon ? (
                  <div className="mt-7">
                    <button
                      type="button"
                      disabled
                      className="h-11 w-full rounded-full border border-warning/50 bg-warning-container/30 text-label-md font-bold text-warning cursor-not-allowed opacity-90 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        schedule
                      </span>
                      <span>{p.cta}</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/register" className="mt-7">
                    <Button
                      variant={p.highlight ? "primary" : "outline"}
                      className="btn-step h-11 w-full rounded-full text-label-lg font-semibold"
                    >
                      {p.cta}
                    </Button>
                  </Link>
                )}
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
            Explore the student storefront or sign in to the seeded Tech
            Society organizer workspace right now.
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
              <span>Browse Student Storefront</span>
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
