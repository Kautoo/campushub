import Link from "next/link";
import { Button } from "@heroui/react";
import {
  DotPattern,
  Meteors,
  Marquee,
  NumberTicker,
  BlurFade,
  ShimmerButton,
} from "@/components/magicui";
import Globe from "@/components/magicui/globe-lazy";
import {
  GetStartedGradientButton,
  TryAiButton,
  PayPalLink,
} from "@/components/marketing/cta-buttons";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon";
import { StatStrip } from "@/components/ui/kpi-card";

export const metadata = {
  title: "CampusHub 2.0 — AI-powered campus events & commerce",
  description:
    "Ticketing, storefront, PayPal payments, and grounded AI insights for campus organizations. One hub, real numbers.",
};

const FEATURES = [
  {
    icon: "event",
    title: "Events & ticketing",
    body: "Publish events in seconds, tiered pricing, capacity control, QR check-in built in.",
  },
  {
    icon: "storefront",
    title: "Campus storefront",
    body: "Merch with live inventory, guest checkout, and session carts — no accounts required.",
  },
  {
    icon: "account_balance_wallet",
    title: "PayPal payments",
    body: "Server-side capture, verified transactions, idempotent webhooks, refunds tracked end-to-end.",
  },
  {
    icon: "auto_awesome",
    title: "AI commerce intelligence",
    body: "Summaries, anomaly scans, and recommendations grounded in your real aggregates — never invented numbers.",
  },
  {
    icon: "group",
    title: "Team workspaces",
    body: "Role-based access for owners, admins, and staff with row-level security on every table.",
  },
  {
    icon: "description",
    title: "Reports & exports",
    body: "One-click CSV exports of orders, transactions, and registrations via signed URLs.",
  },
];

const STATS = [
  { label: "Revenue tracked", value: 45230, format: "money" as const, icon: "payments" },
  { label: "Members", value: 2847, icon: "group" },
  { label: "Tickets sold", value: 1420, icon: "confirmation_number" },
  { label: "Uptime", value: 99.9, format: "pct" as const, icon: "cloud_done" },
];

const PRICING = [
  {
    name: "Society",
    price: "RM 0",
    per: "/month",
    tagline: "For small clubs getting started",
    features: ["1 organization", "Up to 3 events", "Storefront with 20 products", "PayPal checkout", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Campus",
    price: "RM 99",
    per: "/month",
    tagline: "For active societies running commerce",
    features: [
      "Unlimited events",
      "Unlimited products",
      "AI insights (grounded)",
      "Bryntum scheduling timeline",
      "CSV reports & exports",
      "Priority support",
    ],
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
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-lowest/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-primary-container flex h-9 w-9 items-center justify-center rounded-lg text-white dark:bg-primary dark:text-[#00201c]">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </span>
            <span className="text-headline-sm text-ink">CampusHub 2.0</span>
          </Link>
          <nav className="ml-8 hidden gap-6 md:flex">
            <a href="#features" className="text-label-lg text-muted hover:text-ink">Features</a>
            <a href="#pricing" className="text-label-lg text-muted hover:text-ink">Pricing</a>
            <Link href="/demo" className="text-label-lg text-muted hover:text-ink">Storefront</Link>
            <Link href="/styleguide" className="text-label-lg text-muted hover:text-ink">Styleguide</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-label-lg text-muted hover:text-ink">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white dark:text-[#00201c] focus-aura inline-flex h-10 items-center rounded-full px-5 text-label-md font-semibold hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <DotPattern className="text-outline-variant absolute inset-0 [mask-image:radial-gradient(600px_at_50%_20%,white,transparent)]" />
        <Meteors number={8} />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 text-center lg:px-8">
          <BlurFade>
            <Badge tone="teal" icon="auto_awesome">
              AI-powered · Grounded in your real data
            </Badge>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="text-display-lg text-ink mx-auto mt-6 max-w-3xl">
              Run your campus empire from one hub.
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="text-body-lg text-muted mx-auto mt-4 max-w-xl">
              Events, ticketing, storefront, and PayPal payments for campus
              organizations — with AI insights computed from your actual
              numbers, not hallucinations.
            </p>
          </BlurFade>
          <BlurFade delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <GetStartedGradientButton />
              <Link href="/demo">
                <ShimmerButton className="h-11 px-6">
                  Visit the demo store →
                </ShimmerButton>
              </Link>
            </div>
          </BlurFade>
          <div className="mx-auto mt-14 max-w-md">
            <Globe className="mx-auto" />
          </div>
        </div>
      </section>

      {/* Logo marquee */}
      <section className="border-y border-outline-variant py-6">
        <Marquee pauseOnHover className="[--duration:22s]">
          {["PayPal", "Supabase", "Vercel AI SDK", "AG Grid", "Bryntum Scheduler", "Channel3", "Astropods", "Magic UI"].map(
            (n) => (
              <span key={n} className="text-label-lg text-muted mx-8 whitespace-nowrap">
                {n}
              </span>
            ),
          )}
        </Marquee>
      </section>

      {/* Feature bento */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <h2 className="text-display text-ink text-center">Everything a society needs</h2>
        <p className="text-body-lg text-muted mx-auto mt-3 max-w-lg text-center">
          One codebase, one login, one source of truth for events and commerce.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <BlurFade key={f.title} delay={i * 0.05}>
              <article className="h-full rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-card transition-transform duration-200 hover:-translate-y-0.5">
                <IconTile icon={f.icon} tone="teal" />
                <h3 className="text-headline-sm text-ink mt-4">{f.title}</h3>
                <p className="text-body-md text-muted mt-2">{f.body}</p>
              </article>
            </BlurFade>
          ))}
        </div>

        <div className="mt-10">
          <StatStrip
            items={STATS.map((s) => ({
              label: s.label,
              value: s.value,
              icon: s.icon,
              format: s.format === "money" ? ("money" as const) : undefined,
            }))}
          />
          <p className="text-body-sm text-muted mt-2 text-center">
            Numbers shown are from the seeded Tech Society demo data.
          </p>
        </div>
      </section>

      {/* AI section */}
      <section className="relative overflow-hidden border-y border-outline-variant bg-surface-low py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge tone="teal" icon="verified">
              Grounded AI — no fabricated numbers
            </Badge>
            <h2 className="text-display text-ink mt-4">
              Ask your data anything.
            </h2>
            <p className="text-body-lg text-muted mt-3">
              The AI reads a metrics pack computed live from your database —
              revenue by day, sell-through per tier, refund rate, stock levels
              — and is forbidden from using any number outside it. If the data
              isn&apos;t there, it says so.
            </p>
            <div className="mt-6 flex gap-3">
              <TryAiButton />
              <PayPalLink />
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-card">
            <p className="text-label-md text-muted">Sample insight</p>
            <p className="text-body-md text-ink mt-3">
              “Revenue concentrated in Innovation Week: VIP tier contributed
              RM 3,383 (17 of 50 seats). Mech Keycap Set is at 12 units with a
              4/week sell rate — restock within 3 weeks to avoid a stockout
              during the bootcamp.”
            </p>
            <div className="mt-4 flex gap-2">
              <Badge tone="teal">glm-5.3-flash</Badge>
              <Badge tone="neutral">verified aggregates only</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <h2 className="text-display text-ink text-center">Simple pricing</h2>
        <p className="text-body-lg text-muted mt-3 text-center">
          Start free. Upgrade when your society starts selling.
        </p>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PRICING.map((p) => (
            <article
              key={p.name}
              className={
                "relative flex flex-col rounded-xl border p-6 shadow-card transition-transform duration-200 hover:-translate-y-0.5 " +
                (p.highlight
                  ? "border-primary bg-surface-lowest ring-1 ring-primary"
                  : "border-outline-variant bg-surface-lowest")
              }
            >
              {p.highlight ? (
                <span className="absolute -top-3 left-6">
                  <Badge tone="primary">Most popular</Badge>
                </span>
              ) : null}
              <h3 className="text-headline-md text-ink">{p.name}</h3>
              <p className="text-body-sm text-muted mt-1">{p.tagline}</p>
              <p className="mt-4">
                <span className="text-display text-ink">{p.price}</span>
                <span className="text-body-md text-muted">{p.per}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-body-md text-muted flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-success">
                      check
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-6">
                <Button
                  variant={p.highlight ? "primary" : "outline"}
                  className="h-11 w-full rounded-full text-label-lg"
                >
                  {p.cta}
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA + footer */}
      <section className="bg-primary-container relative overflow-hidden py-20 text-white dark:bg-surface-container dark:text-ink">
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-display">Your campus, one hub.</h2>
          <p className="text-body-lg mt-3 opacity-80">
            Set up in minutes: connect Supabase, add PayPal sandbox keys, and
            start selling at your next event.
          </p>
          <Link
            href="/register"
            className="focus-aura mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-label-lg font-semibold text-primary-container dark:bg-primary dark:text-[#00201c]"
          >
            Create your workspace
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-body-sm text-muted">
            © CampusHub 2.0 · Built with Next.js, Supabase, PayPal, and the
            Vercel AI SDK
          </p>
          <div className="flex gap-6">
            <Link href="/demo" className="text-body-sm text-muted hover:text-ink">Storefront</Link>
            <Link href="/styleguide" className="text-body-sm text-muted hover:text-ink">Styleguide</Link>
            <Link href="/login" className="text-body-sm text-muted hover:text-ink">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
