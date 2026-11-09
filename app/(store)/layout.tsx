import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartPill } from "@/components/store/cart-pill";
import { StoreNav } from "@/components/store/store-nav";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Announcement & Verification Ribbon — always deep navy for crisp contrast */}
      <div className="bg-[#00162e] text-white border-b border-white/10 px-4 py-2 text-center text-label-sm">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#5eead4] animate-pulse" />
            <span className="font-semibold tracking-wide text-white">
              OFFICIAL UNIVERSITY STOREFRONT &amp; TICKETING PORTAL
            </span>
            <span className="hidden md:inline text-slate-300">
              · Instant QR Event Passes · 100% PayPal Escrow Protection
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-300">
            <span>Currency: MYR (RM)</span>
            <span>·</span>
            <Link
              href="/dashboard/events"
              className="text-[#5eead4] font-semibold hover:underline"
            >
              Bryntum Schedule View →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Multi-Page E-Commerce Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface-lowest/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/demo" className="flex items-center gap-2.5 shrink-0">
              <span className="bg-primary text-on-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  hub
                </span>
              </span>
              <div className="flex flex-col">
                <span className="text-headline-sm font-bold text-on-surface leading-none tracking-tight">
                  CampusHub
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-0.5">
                  STOREFRONT 2.0
                </span>
              </div>
            </Link>

            <div className="hidden md:block">
              <StoreNav />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <CartPill />
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full border border-outline-variant/70 bg-surface-low px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                space_dashboard
              </span>
              <span>Organizer SaaS</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Secondary Subpage Bar */}
        <div className="border-t border-outline-variant/40 px-4 py-2 md:hidden">
          <StoreNav />
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-outline-variant/60 bg-surface-lowest px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-outline-variant/40">
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="material-symbols-outlined text-[18px]">
                  hub
                </span>
              </span>
              <span className="text-headline-sm font-bold text-on-surface">
                CampusHub 2.0 Commerce &amp; Ticketing
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant max-w-md leading-relaxed">
              Multi-page higher-education event ticketing and society
              merchandise storefront powered by atomic Postgres inventory locks,
              Bryntum venue scheduling, AG Grid financial ledgers, and PayPal
              Orders v2 escrow.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-label-sm uppercase tracking-wider font-bold text-secondary block">
              Storefront Pages
            </span>
            <ul className="space-y-1.5 text-body-sm text-on-surface-variant">
              <li>
                <Link href="/demo" className="hover:text-primary transition-colors">
                  Storefront Home
                </Link>
              </li>
              <li>
                <Link
                  href="/demo/events"
                  className="hover:text-primary transition-colors"
                >
                  Campus Events &amp; Passes
                </Link>
              </li>
              <li>
                <Link
                  href="/demo/shop"
                  className="hover:text-primary transition-colors"
                >
                  Official Merch Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/demo/societies"
                  className="hover:text-primary transition-colors"
                >
                  Accredited Societies
                </Link>
              </li>
              <li>
                <Link
                  href="/demo/cart"
                  className="hover:text-primary transition-colors"
                >
                  Shopping Bag &amp; Checkout
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
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                >
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/events"
                  className="hover:text-primary transition-colors"
                >
                  Bryntum Timeline &amp; Events Grid
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/products"
                  className="hover:text-primary transition-colors"
                >
                  AG Grid SKU Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/ai-insights"
                  className="hover:text-primary transition-colors"
                >
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
