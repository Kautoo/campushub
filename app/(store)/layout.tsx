import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartPill } from "@/components/store/cart-pill";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Announcement & Verification Ribbon */}
      <div className="bg-primary text-on-primary border-b border-white/10 px-4 py-2 text-center text-label-sm">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-secondary-fixed animate-pulse" />
            <span className="font-semibold tracking-wide">
              OFFICIAL UNIVERSITY STOREFRONT &amp; TICKETING PORTAL
            </span>
            <span className="hidden md:inline text-on-primary-container">
              · Instant QR Event Passes · 100% PayPal Escrow Protection
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-on-primary-container">
            <span>Currency: MYR (RM)</span>
            <span>·</span>
            <Link
              href="/dashboard/events"
              className="text-secondary-fixed font-semibold hover:underline"
            >
              Bryntum Schedule View →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/50 bg-surface-lowest/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/demo" className="flex items-center gap-2.5">
              <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl text-secondary-fixed shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  hub
                </span>
              </span>
              <div className="flex flex-col">
                <span className="text-headline-sm font-bold text-primary leading-none tracking-tight">
                  CampusHub
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-0.5">
                  STOREFRONT 2.0
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <a
                href="#events-section"
                className="rounded-lg px-3 py-1.5 text-label-lg font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
              >
                Events &amp; Passes
              </a>
              <a
                href="#merch-section"
                className="rounded-lg px-3 py-1.5 text-label-lg font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
              >
                Official Merch
              </a>
              <a
                href="#saas-architecture"
                className="rounded-lg px-3 py-1.5 text-label-lg font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
              >
                SaaS Architecture
              </a>
              <a
                href="#societies-section"
                className="rounded-lg px-3 py-1.5 text-label-lg font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
              >
                Societies
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <CartPill />
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-low px-4 text-label-md font-semibold text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                space_dashboard
              </span>
              <span>Organizer Console</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-outline-variant/50 bg-surface-lowest px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-outline-variant/35">
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">
                  hub
                </span>
              </span>
              <span className="text-headline-sm font-bold text-primary">
                CampusHub 2.0 Commerce &amp; Ticketing
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant max-w-md leading-relaxed">
              Unified higher-education event ticketing, society merchandise
              storefront, Bryntum venue timeline scheduling, AG Grid financial
              ledgers, and PayPal Orders v2 escrow settlement.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
              Storefront &amp; Checkout
            </span>
            <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
              <li>
                <a href="#events-section" className="hover:text-primary">
                  Campus Event Passes
                </a>
              </li>
              <li>
                <a href="#merch-section" className="hover:text-primary">
                  Society Merchandise Catalog
                </a>
              </li>
              <li>
                <Link href="/demo/checkout" className="hover:text-primary">
                  PayPal Guest Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
              Organizer SaaS Suite
            </span>
            <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/events" className="hover:text-primary">
                  Bryntum Timeline &amp; Events Grid
                </Link>
              </li>
              <li>
                <Link href="/dashboard/ai-insights" className="hover:text-primary">
                  Grounded AI Intelligence
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-sm text-on-surface-variant">
          <p>
            CampusHub 2.0 · Payments secured by PayPal Orders v2 · Guest checkout enabled
          </p>
          <p className="font-mono text-[11px]">
            Postgres + AG Grid Community + Bryntum Scheduler
          </p>
        </div>
      </footer>
    </div>
  );
}
