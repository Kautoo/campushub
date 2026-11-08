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
  { name: "PayPal", icon: "account_balance_wallet" },
  { name: "Render Postgres", icon: "database" },
  { name: "AI SDK", icon: "auto_awesome" },
  { name: "AG Grid", icon: "table_chart" },
  { name: "Bryntum", icon: "calendar_month" },
  { name: "Next.js", icon: "code_blocks" },
];

const STORY_ACTS = [
  {
    id: "launch",
    eyebrow: "Launch",
    title: "Go live in minutes, not weeks",
    body: "Create the event, set tiered pricing, and publish to your storefront before the meeting ends.",
    bullets: [
      "Tiered tickets with capacity control",
      "Perk lists and per-order limits",
      "One toggle from draft to published",
    ],
    icon: "rocket_launch",
  },
  {
    id: "sell",
    eyebrow: "Sell",
    title: "Every sale, verified by PayPal",
    body: "Guest checkout converts browsers at the booth and on their phones — stock stays honest because the server decides.",
    bullets: [
      "Atomic stock — no oversell, ever",
      "Capture verified server-side",
      "Idempotent webhooks, refund tracking",
    ],
    icon: "storefront",
  },
  {
    id: "insight",
    eyebrow: "Understand",
    title: "AI that only knows your numbers",
    body: "Weekly summaries, anomaly scans, and recommendations computed from a live metrics pack — nothing invented.",
    bullets: [
      "Streaming “ask your data” chat",
      "Sell-through and refund anomalies",
      "Every answer cites real aggregates",
    ],
    icon: "auto_awesome",
  },
];

const FEATURES = [
  { icon: "event", title: "Events & ticketing", body: "Publish in seconds. Tiered pricing, capacity control, QR check-in." },
  { icon: "storefront", title: "Campus storefront", body: "Live inventory, guest checkout, session carts. No accounts needed." },
  { icon: "account_balance_wallet", title: "PayPal payments", body: "Server-side capture, verified transactions, idempotent webhooks." },
  { icon: "auto_awesome", title: "AI commerce intelligence", body: "Answers computed from your aggregates — never invented numbers." },
  { icon: "group", title: "Team workspaces", body: "Owner, admin, staff roles with row-level security on every table." },
  { icon: "description", title: "Reports & exports", body: "One-click CSVs of orders, transactions, registrations — signed URLs." },
];

const STATS = [
  { label: "Revenue tracked", value: 45230, money: true, icon: "payments" },
  { label: "Members", value: 2847, money: false, icon: "group" },
  { label: "Tickets sold", value: 1420, money: false, icon: "confirmation_number" },
  { label: "Events per term", value: 6, money: false, icon: "event" },
];

const PRICING = [
  {
    name: "Society",
    price: "RM 0",
    per: "/month",
    tagline: "For small clubs getting started",
    features: ["1 organization", "Up to 3 events", "20 storefront products", "PayPal checkout", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Campus",
    price: "RM 99",
    per: "/month",
    tagline: "For societies that sell at every event",
    features: ["Unlimited events", "Unlimited products", "Grounded AI insights", "Scheduling timeline", "CSV reports & exports", "Priority support"],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Institution",
    price: "Custom",
    per: "",
    tagline: "For universities and multi-org campuses",
    features: ["Multi-organization", "SSO & SCIM", "Dedicated infrastructure", "SLA & onboarding", "Custom integrations"],
    cta: "Talk to us",
    highlight: false,
  },
];


export default function LandingPage() {
  return (
    <div className="bg-background">
      <SiteNav />

      {/* ACT I — centered airy hero over interactive dots + glow bar */}
      <CenterHero techIcons={HERO_ICONS} />

      {/* Proof band */}
      <section className="border-y border-outline-variant py-5" aria-label="Built with">
        <Marquee pauseOnHover className="[--duration:22s]">
          {["PayPal", "Render Postgres", "Vercel AI SDK", "AG Grid", "Bryntum Scheduler", "Channel3", "Astropods", "Magic UI"].map(
            (n) => (
              <span key={n} className="text-on-surface-variant mx-8 flex items-center gap-2 whitespace-nowrap text-sm font-medium">
                <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
                {n}
              </span>
            ),
          )}
        </Marquee>
      </section>

      {/* ACT II — the product, live */}
      <section id="story" className="mx-auto max-w-6xl px-4 py-24 lg:px-8">
        <BlurFade>
          <SectionHeader
            icon="space_dashboard"
            title="One dashboard, every ringgit accounted for"
            subtitle="Orders, tickets, and stock in one view — the actual product UI, not a screenshot."
          />
        </BlurFade>
        <BlurFade delay={0.1}>
          <div className="mt-10">
            <DashboardPreview />
          </div>
        </BlurFade>
      </section>

      <SectionBeat />

      {/* ACT III — scroll story */}
      <section className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <BlurFade>
          <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-[0.2em]">
            The story of one event
          </p>
          <RevealHeading
            text="From launch week to restock day."
            accentWord="restock"
            className="text-display text-on-surface mt-3 max-w-2xl"
          />
        </BlurFade>
        <div className="mt-16">
          <StoryActs acts={STORY_ACTS} />
        </div>
      </section>

      <SectionBeat />

      {/* ACT IV — bento + stat wall */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <BlurFade>
          <RevealHeading text="Everything a society needs" className="text-display text-on-surface" />
          <p className="text-on-surface-variant mt-3 max-w-lg text-lg">
            One codebase, one login, one source of truth for events and
            commerce.
          </p>
        </BlurFade>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <BlurFade key={f.title} delay={i * 0.04}>
              <article className="card-lift h-full rounded-xl bg-surface-container-lowest shadow-sm p-6 shadow-card">
                <IconTile icon={f.icon} tone="teal" />
                <h3 className="text-on-surface mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">{f.body}</p>
              </article>
            </BlurFade>
          ))}
        </div>

        <div className="mt-16">
          <StatWall stats={STATS} />
        </div>
        <p className="text-on-surface-variant mt-3 text-center text-xs">
          Figures from the seeded Tech Society demo workspace.
        </p>
      </section>

      {/* ACT V — AI moment */}
      <section className="relative overflow-hidden border-y border-outline-variant bg-surface-low py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge tone="teal" icon="verified">
              Grounded AI — no fabricated numbers
            </Badge>
            <RevealHeading
              text="Ask your data anything."
              accentWord="anything."
              className="text-display text-on-surface mt-4"
            />
            <p className="text-on-surface-variant mt-4 text-lg leading-relaxed">
              The AI reads a metrics pack computed live from your database —
              revenue by day, sell-through per tier, refund rate, stock — and
              is forbidden from using any number outside it.
            </p>
            <div className="mt-7">
              <TryAiButton />
            </div>
          </div>
          <div className="relative">
            <InsightConversation />
            <div className="mt-4 flex justify-end gap-2">
              <Badge tone="teal">glm-5.3-flash</Badge>
              <Badge tone="neutral">verified aggregates only</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ACT VI — pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 lg:px-8">
        <BlurFade>
          <RevealHeading text="Simple pricing" className="text-display text-on-surface text-center" />
          <p className="text-on-surface-variant mt-3 text-center text-lg">
            Start free. Upgrade when your society starts selling.
          </p>
        </BlurFade>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PRICING.map((p, i) => (
            <BlurFade key={p.name} delay={i * 0.06}>
              <article
                className={
                  "card-lift relative flex h-full flex-col rounded-2xl border p-7 shadow-card " +
                  (p.highlight
                    ? "border-primary bg-surface-lowest ring-1 ring-primary"
                    : "border-outline-variant bg-surface-lowest")
                }
              >
                {p.highlight ? (
                  <span className="absolute -top-3 left-7">
                    <Badge tone="primary">Most popular</Badge>
                  </span>
                ) : null}
                <h3 className="text-headline-md text-on-surface">{p.name}</h3>
                <p className="text-on-surface-variant mt-1 text-sm">{p.tagline}</p>
                <p className="mt-5">
                  <span className="text-display text-on-surface">{p.price}</span>
                  <span className="text-on-surface-variant text-sm">{p.per}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="text-on-surface-variant flex items-start gap-2.5 text-sm">
                      <span className="material-symbols-outlined mt-0.5 text-[16px] text-success">check</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-7">
                  <Button
                    variant={p.highlight ? "primary" : "outline"}
                    className="btn-step h-11 w-full rounded-full text-label-lg"
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
      <section className="relative overflow-hidden py-28">
        {/* Neutral base: same background token as the page — clean in both
            themes. The aurora glows were removed: over the light-mode
            primary-container wash the teal-on-navy mixes turned muddy. */}
        {/* Interactive dot field (same component as the hero) with a soft
            top-center glow sitting behind it */}
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
          <p className="text-on-surface-variant mx-auto mt-4 max-w-xl text-lg leading-relaxed">
            Connect a Postgres database, add PayPal sandbox keys, and sell at your next
            event — with every number grounded in your own data.
          </p>
          <Magnetic className="mt-9">
            <Link
              href="/register"
              className="btn-step focus-aura bg-primary inline-flex h-12 items-center rounded-full px-9 text-label-lg font-semibold text-white shadow-xl shadow-primary/25 dark:text-[#00201c]"
            >
              Create your workspace
            </Link>
          </Magnetic>
          <p className="text-on-surface-variant mt-5 text-sm">
            Free Society tier · no credit card · demo data included
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
