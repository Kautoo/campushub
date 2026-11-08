import Link from "next/link";
import { Button } from "@heroui/react";
import {
  Meteors,
  Marquee,
  BlurFade,
  ShimmerButton,
} from "@/components/magicui";
import GlobeLazy from "@/components/magicui/globe-lazy";
import HeroBackgroundLazy from "@/components/marketing/hero-background-lazy";
import { RevealHeading } from "@/components/marketing/reveal-heading";
import { StoryActs } from "@/components/marketing/story-acts";
import {
  StatWall,
  SectionBeat,
} from "@/components/marketing/premium-sections";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GetStartedGradientButton, TryAiButton } from "@/components/marketing/cta-buttons";
import { Magnetic } from "@/components/marketing/magnetic";
import { TypewriterInsight } from "@/components/marketing/typewriter-insight";
import { DashboardMock } from "@/components/marketing/dashboard-mock";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/primitives";

export const metadata = {
  title: "CampusHub 2.0 — AI-powered campus events & commerce",
  description:
    "Ticketing, storefront, PayPal payments, and grounded AI insights for campus organizations. One hub, real numbers.",
};

const STORY_ACTS = [
  {
    id: "launch",
    eyebrow: "Launch",
    title: "Go live in minutes, not weeks",
    body: "Create the event, set tiered pricing, and publish to your storefront before the meeting ends.",
    bullets: ["Tiered tickets with capacity control", "Perk lists and per-order limits", "One toggle from draft to published"],
    icon: "rocket_launch",
  },
  {
    id: "sell",
    eyebrow: "Sell",
    title: "Every sale, verified by PayPal",
    body: "Guest checkout converts browsers at the booth and on their phones — stock stays honest because the server decides.",
    bullets: ["Atomic stock — no oversell, ever", "Capture verified server-side", "Idempotent webhooks, refund tracking"],
    icon: "storefront",
  },
  {
    id: "insight",
    eyebrow: "Understand",
    title: "AI that only knows your numbers",
    body: "Weekly summaries, anomaly scans, and recommendations computed from a live metrics pack — nothing invented.",
    bullets: ["Streaming “ask your data” chat", "Sell-through and refund anomalies", "Every answer cites real aggregates"],
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

const INSIGHT_TEXT =
  "Revenue concentrated in Innovation Week: the VIP tier contributed RM 3,383 — 17 of 50 seats. Mech Keycap Set sits at 12 units against a 4-per-week sell rate: restock within three weeks to survive the bootcamp.";

export default function LandingPage() {
  return (
    <div className="bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-lowest/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="CampusHub 2.0 home">
            <span className="bg-primary-container flex h-9 w-9 items-center justify-center rounded-lg text-white transition-transform duration-200 hover:scale-105 dark:bg-primary dark:text-[#00201c]">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </span>
            <span className="text-headline-sm text-ink">CampusHub</span>
            <span className="hidden rounded-full border border-outline-variant px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
              2.0
            </span>
          </Link>
          <nav className="ml-8 hidden gap-6 md:flex" aria-label="Primary">
            <a href="#story" className="link-draw text-label-lg text-muted hover:text-ink">Product</a>
            <a href="#features" className="link-draw text-label-lg text-muted hover:text-ink">Features</a>
            <a href="#pricing" className="link-draw text-label-lg text-muted hover:text-ink">Pricing</a>
            <Link href="/demo" className="link-draw text-label-lg text-muted hover:text-ink">Storefront</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="link-draw hidden text-label-lg text-muted hover:text-ink sm:block">
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-step bg-primary text-white dark:text-[#00201c] focus-aura inline-flex h-10 items-center rounded-full px-5 text-label-md font-semibold"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ACT I — the dark cinematic hero, one screen alone */}
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-[#070d18] text-white">
        <div className="animate-gradient-flow bg-gradient-kinetic absolute inset-0 opacity-30" aria-hidden />
        <div className="absolute inset-0" aria-hidden>
          <HeroBackgroundLazy />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#070d18]/70 via-[#070d18]/20 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070d18] to-transparent" aria-hidden />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 lg:px-8">
          <div className="max-w-3xl">
            <BlurFade>
              <p className="font-mono text-label-sm uppercase tracking-[0.2em] text-[var(--st-primary)]">
                Campus events · Commerce · Payments
              </p>
            </BlurFade>
            <BlurFade delay={0.08}>
              <h1 className="mt-5 text-[clamp(2.75rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
                Run your campus{" "}
                <span className="font-editorial font-medium italic text-[var(--st-primary)]">
                  empire
                </span>{" "}
                from one hub.
              </h1>
            </BlurFade>
            <BlurFade delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Ticketing, storefront, and PayPal payments for campus
                societies — with AI answers computed from your real numbers.
              </p>
            </BlurFade>
            <BlurFade delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <GetStartedGradientButton />
                </Magnetic>
                <Link href="/demo">
                  <ShimmerButton className="btn-step h-11 px-6">
                    Visit the demo store →
                  </ShimmerButton>
                </Link>
              </div>
            </BlurFade>
            <BlurFade delay={0.32}>
              <p className="mt-7 flex items-center gap-2 text-sm text-white/60">
                <span className="material-symbols-outlined text-[16px] text-[var(--st-tertiary-fixed-dim)]">
                  verified
                </span>
                <span>
                  <strong className="tabular-nums text-white">RM 45,230</strong>{" "}
                  tracked in the demo workspace — free to explore, no signup.
                </span>
              </p>
            </BlurFade>
          </div>

          <div className="pointer-events-none absolute right-[-120px] top-1/2 hidden -translate-y-1/2 opacity-90 xl:block">
            <GlobeLazy />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block" aria-hidden>
          <span className="material-symbols-outlined animate-bounce text-[20px] text-white/40">
            keyboard_arrow_down
          </span>
        </div>
      </section>

      {/* ACT II — social proof band */}
      <section className="border-y border-outline-variant py-5" aria-label="Built with">
        <Marquee pauseOnHover className="[--duration:22s]">
          {["PayPal", "Supabase", "Vercel AI SDK", "AG Grid", "Bryntum Scheduler", "Channel3", "Astropods", "Magic UI"].map(
            (n) => (
              <span key={n} className="text-muted mx-8 flex items-center gap-2 whitespace-nowrap text-sm font-medium">
                <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
                {n}
              </span>
            ),
          )}
        </Marquee>
      </section>

      {/* ACT III — the product, live */}
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
            <DashboardMock />
          </div>
        </BlurFade>
      </section>

      <SectionBeat />

      {/* ACT IV — the scroll story: launch → sell → understand */}
      <section className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <BlurFade>
          <p className="font-mono text-label-sm text-muted uppercase tracking-[0.2em]">
            The story of one event
          </p>
          <RevealHeading
            text="From launch week to restock day."
            accentWord="restock"
            className="text-display text-ink mt-3 max-w-2xl"
          />
        </BlurFade>
        <div className="mt-16">
          <StoryActs acts={STORY_ACTS} />
        </div>
      </section>

      <SectionBeat />

      {/* ACT V — bento features + the stat wall */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <BlurFade>
          <RevealHeading text="Everything a society needs" className="text-display text-ink" />
          <p className="text-muted mt-3 max-w-lg text-lg">
            One codebase, one login, one source of truth for events and
            commerce.
          </p>
        </BlurFade>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <BlurFade key={f.title} delay={i * 0.04}>
              <article className="card-lift h-full rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-card">
                <IconTile icon={f.icon} tone="teal" />
                <h3 className="text-ink mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{f.body}</p>
              </article>
            </BlurFade>
          ))}
        </div>

        <div className="mt-16">
          <StatWall stats={STATS} />
        </div>
        <p className="text-muted mt-3 text-center text-xs">
          Figures from the seeded Tech Society demo workspace.
        </p>
      </section>

      {/* ACT VI — the AI moment */}
      <section className="relative overflow-hidden border-y border-outline-variant bg-surface-low py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge tone="teal" icon="verified">
              Grounded AI — no fabricated numbers
            </Badge>
            <RevealHeading
              text="Ask your data anything."
              accentWord="anything."
              className="text-display text-ink mt-4"
            />
            <p className="text-muted mt-4 text-lg leading-relaxed">
              The AI reads a metrics pack computed live from your database —
              revenue by day, sell-through per tier, refund rate, stock — and
              is forbidden from using any number outside it.
            </p>
            <div className="mt-7">
              <TryAiButton />
            </div>
          </div>
          <div className="relative rounded-2xl border border-outline-variant bg-surface-lowest p-7 shadow-card">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
              <p className="text-label-md text-muted uppercase tracking-widest">Weekly insight</p>
            </div>
            <div className="mt-4 min-h-40">
              <TypewriterInsight text={INSIGHT_TEXT} />
            </div>
            <div className="mt-5 flex gap-2">
              <Badge tone="teal">glm-5.3-flash</Badge>
              <Badge tone="neutral">verified aggregates only</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ACT VII — pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 lg:px-8">
        <BlurFade>
          <RevealHeading text="Simple pricing" className="text-display text-ink text-center" />
          <p className="text-muted mt-3 text-center text-lg">
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
                <h3 className="text-headline-md text-ink">{p.name}</h3>
                <p className="text-muted mt-1 text-sm">{p.tagline}</p>
                <p className="mt-5">
                  <span className="text-display text-ink">{p.price}</span>
                  <span className="text-muted text-sm">{p.per}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="text-muted flex items-start gap-2.5 text-sm">
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
      <section className="bg-primary-container relative overflow-hidden py-24 text-white dark:bg-surface-container dark:text-ink">
        <Meteors number={5} />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <RevealHeading
            text="Your campus, one hub."
            accentWord="one"
            className="text-display text-white dark:text-ink"
          />
          <p className="mt-4 text-lg opacity-80">
            Connect Supabase, add PayPal sandbox keys, sell at your next event.
          </p>
          <Magnetic className="mt-9">
            <Link
              href="/register"
              className="focus-aura inline-flex h-12 items-center rounded-full bg-white px-9 text-label-lg font-semibold text-primary-container shadow-lg transition-transform hover:-translate-y-0.5 dark:bg-primary dark:text-[#00201c]"
            >
              Create your workspace
            </Link>
          </Magnetic>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-muted text-sm">
            © CampusHub 2.0 · Built with Next.js, Supabase, PayPal, and the
            Vercel AI SDK
          </p>
          <nav className="flex gap-6" aria-label="Footer">
            <Link href="/demo" className="link-draw text-muted text-sm hover:text-ink">Storefront</Link>
            <Link href="/styleguide" className="link-draw text-muted text-sm hover:text-ink">Styleguide</Link>
            <Link href="/privacy" className="link-draw text-muted text-sm hover:text-ink">Privacy</Link>
            <Link href="/tos" className="link-draw text-muted text-sm hover:text-ink">Terms</Link>
            <Link href="/login" className="link-draw text-muted text-sm hover:text-ink">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
