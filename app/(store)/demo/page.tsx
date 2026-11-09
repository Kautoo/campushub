import Link from "next/link";
import { hasDatabaseEnv } from "@/lib/db";
import { SetupNotice } from "@/components/layout/setup-notice";
import { StoreGrid } from "@/components/store/store-grid";
import { TierBuyButton } from "@/components/store/tier-buy-button";
import { StorePrice } from "@/components/store/currency-provider";
import { Badge } from "@/components/ui/badge";
import { StorefrontBanner } from "@/components/store/storefront-banner";
import {
  getStorefrontData,
  STITCH_EVENT_IMAGES,
  CAMPUS_SOCIETIES,
} from "@/lib/storefront";

export const metadata = {
  title: "Storefront & Campus Marketplace — CampusHub 2.0",
};

export default async function DemoStorefront({
  searchParams,
}: {
  searchParams?: Promise<{ org?: string }>;
}) {
  if (!hasDatabaseEnv()) return <SetupNotice what="the storefront" />;

  const params = await searchParams;
  const data = await getStorefrontData(params?.org);
  if (!data) return <SetupNotice what="store data" />;

  const { org, products, events } = data;
  const flagship = events[0];
  const flagshipSold =
    flagship?.tiers.reduce((s, t) => s + t.sold, 0) ?? 220;
  const flagshipCap = flagship?.capacity || 500;
  const flagshipPct = Math.min(
    100,
    Math.round((flagshipSold / flagshipCap) * 100),
  );

  const totalEventPassesSold = events.reduce(
    (s, e) => s + e.tiers.reduce((ts, t) => ts + t.sold, 0),
    0,
  );
  const totalMerchStock = products.reduce((s, p) => s + p.stock, 0);

  return (
    <main className="w-full bg-surface min-h-screen">
      <StorefrontBanner
        orgName={org.name}
        isCustomOrg={org.isCustomOrg}
      />
      {/* ============================================================
          1. HERO & FLAGSHIP EVENT SPOTLIGHT
          ============================================================ */}
      <div className="relative w-full overflow-hidden border-b border-outline-variant/50 bg-surface-lowest">
        <div
          aria-hidden
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[920px] h-96 bg-gradient-to-r from-secondary/12 via-secondary-container/20 to-primary-fixed/25 blur-3xl pointer-events-none rounded-full"
        />

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 7 Cols: Consumer Value Proposition */}
            <div className="lg:col-span-7 flex flex-col gap-5 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-low text-on-surface border border-outline-variant/60 w-fit">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-label-sm font-bold tracking-wider uppercase text-secondary">
                  {org.name} Official Storefront
                </span>
                <span className="text-outline-variant">•</span>
                <span className="text-label-sm text-on-surface-variant">
                  Student Marketplace
                </span>
              </div>

              <h1 className="text-display-lg text-on-surface font-bold tracking-tight">
                Discover Campus Events,{" "}
                <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
                  Digital Passes &amp; Club Gear
                </span>
              </h1>

              <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Grab verified student society tickets with instant QR gate entry
                and shop official faculty-licensed apparel, tech accessories,
                and stationery. Enjoy student member pricing and protected
                PayPal guest checkout.
              </p>

              {/* Consumer Storefront CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/demo/events"
                  className="px-6 py-3 rounded-full bg-primary hover:opacity-90 text-on-primary text-label-lg font-semibold shadow-sm transition-all flex items-center gap-2 group"
                >
                  <span>Explore Events ({events.length})</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/demo/shop"
                  className="px-6 py-3 rounded-full bg-surface-lowest hover:bg-surface-low text-on-surface text-label-lg font-semibold border border-outline-variant/70 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    shopping_bag
                  </span>
                  <span>Shop Official Merch ({products.length})</span>
                </Link>
              </div>

              {/* 4-Column Storefront Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 tabular-nums">
                <Link
                  href="/demo/events"
                  className="rounded-xl border border-outline-variant/50 bg-surface-low/70 p-3 hover:border-secondary/50 transition-colors"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Upcoming Events
                  </span>
                  <span className="text-headline-md font-bold text-primary mt-0.5 block">
                    {events.length}
                  </span>
                  <span className="text-[11px] text-secondary font-medium">
                    Open registration →
                  </span>
                </Link>
                <Link
                  href="/demo/events"
                  className="rounded-xl border border-outline-variant/50 bg-surface-low/70 p-3 hover:border-secondary/50 transition-colors"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Students Joined
                  </span>
                  <span className="text-headline-md font-bold text-primary mt-0.5 block">
                    {totalEventPassesSold.toLocaleString()}+
                  </span>
                  <span className="text-[11px] text-secondary font-medium">
                    Instant QR entry
                  </span>
                </Link>
                <Link
                  href="/demo/shop"
                  className="rounded-xl border border-outline-variant/50 bg-surface-low/70 p-3 hover:border-secondary/50 transition-colors"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Official Merch
                  </span>
                  <span className="text-headline-md font-bold text-primary mt-0.5 block">
                    {products.length} items
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {totalMerchStock.toLocaleString()} in stock
                  </span>
                </Link>
                <Link
                  href="/demo/societies"
                  className="rounded-xl border border-outline-variant/50 bg-surface-low/70 p-3 hover:border-secondary/50 transition-colors"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Verified Clubs
                  </span>
                  <span className="text-headline-md font-bold text-success mt-0.5 block">
                    {CAMPUS_SOCIETIES.length}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Faculty accredited
                  </span>
                </Link>
              </div>
            </div>

            {/* Right 5 Cols: Flagship Event Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="relative w-full rounded-2xl overflow-hidden bg-surface-lowest shadow-xl border border-outline-variant/60 group">
                <Link
                  href={
                    flagship
                      ? `/demo/events/${flagship.slug}`
                      : "/demo/events"
                  }
                  className="relative h-64 w-full overflow-hidden block"
                >
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                      backgroundImage: `url('${
                        flagship?.imageUrl ||
                        STITCH_EVENT_IMAGES["innovation-week-2026"]
                      }')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00162e]/95 via-[#00162e]/50 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#00162e]/90 backdrop-blur text-white text-label-sm font-bold flex items-center gap-1.5 shadow-xs border border-white/15">
                      <span className="material-symbols-outlined text-[15px] text-[#5eead4]">
                        verified
                      </span>
                      Featured Campus Event
                    </span>
                    <Badge tone="teal">
                      {flagship?.category ?? "Conference"}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 text-label-sm text-[#5eead4] font-semibold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[15px]">
                        location_on
                      </span>
                      <span>{flagship?.venue ?? "Main Hall, Block C"}</span>
                    </div>
                    <h2 className="text-headline-lg font-bold text-white mt-1 leading-tight">
                      {flagship?.title ?? "Innovation Week 2026"}
                    </h2>
                  </div>
                </Link>

                <div className="p-5 space-y-4">
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {flagship?.description ??
                      "Five-day showcase of student startups, hackathons, and keynote talks from industry leaders."}
                  </p>

                  {/* Live Capacity Progress Bar */}
                  <div className="rounded-xl bg-surface-low p-3.5 border border-outline-variant/50 tabular-nums">
                    <div className="flex items-center justify-between text-label-md mb-1.5">
                      <span className="text-on-surface-variant font-medium">
                        Seats Reserved
                      </span>
                      <span className="font-bold text-primary">
                        {flagshipSold} / {flagshipCap} claimed ({flagshipPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: `${flagshipPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="tabular-nums">
                      <span className="text-label-sm text-on-surface-variant block">
                        Student passes from
                      </span>
                      <StorePrice
                        cents={flagship?.tiers?.[0]?.price_cents ?? 4900}
                        className="text-headline-md font-bold text-primary"
                      />
                    </div>
                    <Link
                      href={
                        flagship
                          ? `/demo/events/${flagship.slug}`
                          : "/demo/events"
                      }
                      className="px-5 py-2.5 rounded-full bg-primary hover:opacity-90 text-on-primary text-label-md font-semibold transition-all flex items-center gap-1.5"
                    >
                      <span>Get Tickets</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================
          2. BROWSE BY DEPARTMENT DIRECTORY
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/demo/events"
            className="group rounded-2xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-2xs hover:border-secondary/50 hover:shadow-md transition-all flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">
                  confirmation_number
                </span>
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors">
                Events &amp; Passes
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                {events.length} campus conferences, hackathons &amp; bootcamps
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>

          <Link
            href="/demo/shop"
            className="group rounded-2xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-2xs hover:border-secondary/50 hover:shadow-md transition-all flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors">
                Official Merch Shop
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                {products.length} club apparel, tech gear &amp; stationery items
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>

          <Link
            href="/demo/societies"
            className="group rounded-2xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-2xs hover:border-secondary/50 hover:shadow-md transition-all flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-success-container text-success flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">
                  groups
                </span>
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors">
                Campus Societies
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Meet the {CAMPUS_SOCIETIES.length} accredited student clubs &amp; organizers
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>

          <Link
            href="/demo/cart"
            className="group rounded-2xl border border-outline-variant/50 bg-surface-lowest p-5 shadow-2xs hover:border-secondary/50 hover:shadow-md transition-all flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-warning-container text-warning flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px]">
                  shopping_cart_checkout
                </span>
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors">
                Shopping Bag &amp; Pay
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Review your selected passes &amp; merch with instant checkout
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* ============================================================
          3. UPCOMING CAMPUS EVENTS & TICKET TIERS
          ============================================================ */}
      <section
        id="events-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-label-sm uppercase tracking-widest text-secondary font-bold block">
              Campus Box Office
            </span>
            <h2 className="text-headline-lg font-bold text-on-surface mt-1">
              Upcoming Campus Events &amp; Pass Tiers
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1 max-w-2xl">
              Compare pass perks, check remaining seats, and add passes directly
              to your bag for instant QR entry.
            </p>
          </div>
          <Link
            href="/demo/events"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all shrink-0"
          >
            <span>View All Events ({events.length})</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* 2-Column Detailed Event Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((e) => {
            const totalSold = e.tiers.reduce((s, t) => s + t.sold, 0);
            const cap = e.capacity || 100;
            const fillPct = Math.min(100, Math.round((totalSold / cap) * 100));
            const startFormatted = e.start_at
              ? new Date(e.start_at).toLocaleDateString("en-MY", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Upcoming";

            return (
              <article
                key={e.id}
                className="rounded-2xl bg-surface-lowest border border-outline-variant/50 hover:border-secondary/50 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <Link
                  href={`/demo/events/${e.slug}`}
                  className="relative h-48 w-full overflow-hidden bg-surface-low block group"
                >
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('${
                        e.imageUrl ||
                        STITCH_EVENT_IMAGES["innovation-week-2026"]
                      }')`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00162e]/95 via-[#00162e]/45 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <Badge tone="teal">{e.category ?? "Event"}</Badge>
                    <span className="rounded-full bg-[#00162e]/90 text-white border border-white/15 px-3 py-1 text-label-sm font-bold tabular-nums">
                      {startFormatted}
                    </span>
                  </div>

                  <div className="absolute bottom-3.5 left-4 right-4 text-white flex items-end justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-label-sm text-[#5eead4] font-semibold">
                        <span className="material-symbols-outlined text-[15px]">
                          location_on
                        </span>
                        <span>{e.venue ?? "Campus Quad"}</span>
                        <span>•</span>
                        <span>{org.name}</span>
                      </div>
                      <h3 className="text-headline-md font-bold text-white mt-0.5">
                        {e.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-semibold text-white shrink-0">
                      Event Page →
                    </span>
                  </div>
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    {e.description ? (
                      <p className="text-body-md text-on-surface-variant leading-relaxed">
                        {e.description}
                      </p>
                    ) : null}

                    <div className="flex items-center justify-between gap-3 text-label-sm tabular-nums pt-1">
                      <span className="text-on-surface-variant">
                        Seats Reserved:{" "}
                        <strong className="text-on-surface">
                          {totalSold} / {cap}
                        </strong>
                      </span>
                      <span className="font-bold text-secondary">
                        {fillPct}% claimed
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <span className="text-label-sm uppercase tracking-wider font-bold text-on-surface-variant">
                        Available Pass Tiers ({e.tiers.length})
                      </span>
                      <Link
                        href={`/demo/events/${e.slug}`}
                        className="text-label-sm font-semibold text-secondary hover:underline"
                      >
                        Full schedule &amp; venue info →
                      </Link>
                    </div>
                    {e.tiers.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {e.tiers
                          .filter((t) => t.quantity - t.sold > 0)
                          .map((t) => (
                            <TierBuyButton
                              key={t.id}
                              tier={{
                                tier_id: t.id,
                                name: `${e.title} — ${t.name}`,
                                price_cents: t.price_cents,
                                qty: 1,
                              }}
                              perks={t.perks}
                              remaining={t.quantity - t.sold}
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-body-sm text-on-surface-variant">
                        General admission open on-site.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          4. OFFICIAL MERCHANDISE MARKETPLACE
          ============================================================ */}
      <section
        id="merch-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full border-t border-outline-variant/45"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-label-sm uppercase tracking-widest text-secondary font-bold block">
              Official Club Storefront
            </span>
            <h2 className="text-headline-lg font-bold text-on-surface mt-1">
              Collegiate Apparel, Tech Gear &amp; Stationery
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1 max-w-2xl">
              Every purchase directly supports student society hackathons and
              workshops. Click any item for full product details or add directly
              to your bag.
            </p>
          </div>
          <Link
            href="/demo/shop"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all shrink-0"
          >
            <span>Open Full Merch Shop</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <StoreGrid products={products} />
      </section>

      {/* ============================================================
          5. PROTECTED COLLEGIATE BUYER GUARANTEE
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-6 w-full">
        <div className="rounded-3xl bg-[#00162e] text-white p-8 lg:p-10 shadow-xl relative overflow-hidden border border-white/10">
          <div
            aria-hidden
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#16a6a0]/25 blur-3xl pointer-events-none"
          />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[#5eead4] text-label-sm font-bold uppercase tracking-wider">
                Student Buyer Protection
              </span>
              <h2 className="text-headline-lg font-bold mt-2.5 text-white">
                Verified Collegiate Commerce Guarantee
              </h2>
              <p className="text-body-md text-slate-300 mt-1 leading-relaxed">
                Shop with confidence — every event pass and society merchandise
                order is backed by official university society accreditation and
                PayPal buyer protection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/8 border border-white/15 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#5eead4]/20 text-[#5eead4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    shield
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-white">
                  100% PayPal Protection
                </h3>
                <p className="text-body-sm text-slate-300 leading-relaxed">
                  Secure guest checkout backed by official university bursary
                  escrow accounts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/8 border border-white/15 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#5eead4]/20 text-[#5eead4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    qr_code_2
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-white">
                  Instant QR Entry
                </h3>
                <p className="text-body-sm text-slate-300 leading-relaxed">
                  Receive your unique digital QR pass immediately upon payment
                  confirmation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/8 border border-white/15 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#5eead4]/20 text-[#5eead4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    storefront
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-white">
                  Easy Campus Pick-Up
                </h3>
                <p className="text-body-sm text-slate-300 leading-relaxed">
                  Collect your official society merch at the Student Union Desk
                  with zero shipping wait.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/8 border border-white/15 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#5eead4]/20 text-[#5eead4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    savings
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-white">
                  Student Member Pricing
                </h3>
                <p className="text-body-sm text-slate-300 leading-relaxed">
                  Subsidized campus pass tiers and official club apparel priced
                  for students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
