import Link from "next/link";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils";
import { IconTile, Icon } from "@/components/ui/icon";
import { Badge, DeltaBadge, type ChipTone } from "@/components/ui/badge";
import { KpiCard, StatStrip } from "@/components/ui/kpi-card";
import {
  SectionHeader,
  EmptyState,
  PriceTag,
} from "@/components/ui/primitives";
import {
  GradientFlowButton,
  PayPalButton,
  ShimmerAIButton,
} from "@/components/ui/kinetic-buttons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DotPattern,
  Meteors,
  ShimmerButton,
  NumberTicker,
  BorderBeam,
  Marquee,
  AnimatedGridPattern,
  Ripple,
} from "@/components/magicui";

export const metadata = { title: "Styleguide — CampusHub 2.0" };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-label-md text-muted mb-3 tracking-wide uppercase">
        {title}
      </h2>
      <div className="rounded-xl border border-outline-variant bg-surface-lowest p-6">
        {children}
      </div>
    </section>
  );
}

function Row({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}

const chipTones: ChipTone[] = [
  "primary",
  "teal",
  "neutral",
  "success",
  "warning",
  "error",
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-label-md text-muted">CampusHub 2.0</p>
          <h1 className="text-display text-ink">Styleguide</h1>
          <p className="text-body-md text-muted">
            Stitch design system — components, tokens, and effects. Toggle
            themes to verify parity.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* 1 — Buttons & Inputs */}
      <Section title="Buttons & Inputs">
        <Row>
          <GradientFlowButton />
          <ShimmerAIButton />
          <PayPalButton />
          <Button variant="primary" className="h-11 px-6">
            Primary pill
          </Button>
          <Button
            
            variant="outline"
            className="h-11 border-outline-variant px-6 text-ink"
          >
            Outline
          </Button>
          <Button isDisabled className="h-11 px-6">
            Disabled
          </Button>
          <ShimmerButton className="h-11">Shimmer CTA</ShimmerButton>
        </Row>
        <Row className="mt-4">
          <input
            placeholder="Email address"
            className="focus-aura h-11 w-64 rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-ink outline-none placeholder:text-muted"
          />
          <select
            className="focus-aura h-11 rounded-lg border border-outline-variant bg-surface-low px-4 text-body-md text-ink"
            aria-label="Example select"
          >
            <option>Select tier</option>
            <option>Student Pass</option>
            <option>VIP Pass</option>
          </select>
        </Row>
      </Section>

      {/* 2 — Navigation & Badges */}
      <Section title="Navigation & Badges">
        <Row>
          {chipTones.map((t) => (
            <Badge key={t} tone={t}>
              {t}
            </Badge>
          ))}
          <DeltaBadge value={12.4} />
          <DeltaBadge value={-3.1} />
          <Badge tone="teal" icon="verified">
            Verified
          </Badge>
        </Row>
        <Row className="mt-4">
          <nav className="flex gap-1 rounded-full bg-surface-container p-1">
            <span className="bg-primary text-white dark:text-[#00201c] rounded-full px-4 py-1.5 text-label-md">
              Overview
            </span>
            <span className="text-muted px-4 py-1.5 text-label-md">Events</span>
            <span className="text-muted px-4 py-1.5 text-label-md">Orders</span>
          </nav>
        </Row>
      </Section>

      {/* 3 — Cards & Bento */}
      <Section title="Cards & Bento">
        <StatStrip
          items={[
            {
              label: "Total revenue",
              value: 4523000,
              delta: 12.4,
              icon: "payments",
              format: "money",
            },
            {
              label: "Members",
              value: 2847,
              delta: 5.2,
              icon: "group",
            },
            {
              label: "Tickets sold",
              value: 1420,
              delta: -2.8,
              icon: "confirmation_number",
            },
            {
              label: "Low stock",
              value: 3,
              icon: "inventory_2",
              tone: "neutral",
            },
          ]}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-low p-5">
            <BorderBeam size={80} duration={8} />
            <IconTile icon="auto_awesome" tone="teal" />
            <h3 className="text-headline-sm text-ink mt-3">AI recommendation</h3>
            <p className="text-body-sm text-muted mt-1">
              Bundle the Teal Tee with Hackathon entry — 38% attach rate.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-low p-5">
            <DotPattern className="text-outline-variant [mask-image:radial-gradient(160px_at_center,white,transparent)]" />
            <div className="relative">
              <h3 className="text-headline-sm text-ink">Dot pattern card</h3>
              <p className="text-body-sm text-muted mt-1">
                Texture uses outline tokens.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-5 text-white dark:bg-primary dark:text-[#00201c]">
            <Meteors number={5} />
            <h3 className="text-headline-sm">Ticker card</h3>
            <p className="text-label-lg mt-2">
              RM{" "}
              <NumberTicker
                value={45230}
                className="text-display inline tracking-tight"
              />
            </p>
            <p className="text-body-sm mt-1 opacity-80">Revenue this term</p>
          </div>
        </div>
        <Row className="mt-4">
          <div className="rounded-xl border border-outline-variant p-4">
            <SectionHeader
              icon="event"
              title="Section header"
              subtitle="Icon tile + heading + subtitle"
            />
          </div>
          <EmptyState
            icon="inbox"
            title="No orders yet"
            body="Orders appear here once the storefront gets its first checkout."
          />
        </Row>
      </Section>

      {/* 4 — Commerce & AI Widgets */}
      <Section title="Commerce & AI Widgets">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-outline-variant bg-surface-lowest p-4">
            <div className="bg-surface-container relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg">
              <Ripple mainCircleSize={140} />
              <span className="material-symbols-outlined text-[40px] text-muted">
                image
              </span>
            </div>
            <p className="text-label-md text-muted">Apparel</p>
            <p className="text-headline-sm text-ink">CampusHub Tee — Navy</p>
            <PriceTag formatted="RM 45.00" originalFormatted="RM 59.00" />
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-lowest p-4">
            <p className="text-label-md text-muted">Event tier picker</p>
            <div className="mt-2 space-y-2">
              {[
                ["Student Pass", "RM 49.00"],
                ["Standard Pass", "RM 99.00"],
                ["VIP Pass", "RM 199.00"],
              ].map(([name, price], i) => (
                <div
                  key={name}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-body-md ${
                    i === 0
                      ? "border-primary bg-primary/5 text-ink"
                      : "border-outline-variant text-muted"
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-label-md font-semibold">{price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-low p-4">
            <BorderBeam size={60} colorFrom="var(--st-gradient-b)" colorTo="var(--st-gradient-c)" />
            <div className="flex items-center gap-2">
              <Icon name="query_stats" size={20} />
              <p className="text-headline-sm text-ink">Grounded AI insight</p>
            </div>
            <p className="text-body-sm text-muted mt-2">
              “Revenue concentrated in Innovation Week VIP tier (RM 3,383,
              17 sold). Restock the keycap set — 12 units left, sells 4/week.”
            </p>
            <div className="mt-3 flex gap-2">
              <Badge tone="teal">glm-5.3-flash</Badge>
              <Badge tone="neutral">verified data</Badge>
            </div>
          </div>
        </div>
        <Row className="mt-4 overflow-hidden rounded-xl border border-outline-variant py-3">
          <Marquee pauseOnHover className="[--duration:18s]">
            {["PayPal", "Render Postgres", "Vercel AI SDK", "AG Grid", "Bryntum", "Channel3", "Astropods"].map(
              (n) => (
                <span
                  key={n}
                  className="text-label-lg text-muted mx-6 flex items-center gap-2"
                >
                  <Icon name="bolt" size={16} /> {n}
                </span>
              ),
            )}
          </Marquee>
        </Row>
      </Section>

      <p className="text-body-sm text-muted">
        Token reference: <code>var(--st-*)</code> in{" "}
        <code>app/globals.css</code> ·{" "}
        <Link href="/" className="text-primary underline">
          Back to landing
        </Link>
        {" · "}
        <Link href="/dashboard" className="text-primary underline">
          Dashboard
        </Link>
      </p>
      <div className="relative mt-6 h-40 overflow-hidden rounded-xl border border-outline-variant">
        <AnimatedGridPattern className="text-outline-variant" numSquares={24} />
      </div>
    </main>
  );
}
