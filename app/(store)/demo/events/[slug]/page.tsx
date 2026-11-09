import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDatabaseEnv } from "@/lib/db";
import { SetupNotice } from "@/components/layout/setup-notice";
import { TierBuyButton } from "@/components/store/tier-buy-button";
import { Badge } from "@/components/ui/badge";
import { getStorefrontData } from "@/lib/storefront";

export const instant = false;

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ org?: string }>;
}) {
  if (!hasDatabaseEnv()) return <SetupNotice what="event details" />;

  const { slug } = await params;
  const sParams = await searchParams;
  const data = await getStorefrontData(sParams?.org);
  if (!data) return <SetupNotice what="event data" />;

  const { org, events } = data;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  const totalSold = event.tiers.reduce((s, t) => s + t.sold, 0);
  const cap = event.capacity || 100;
  const pct = Math.min(100, Math.round((totalSold / cap) * 100));
  const otherEvents = events.filter((e) => e.id !== event.id).slice(0, 3);

  const startDateStr = event.start_at
    ? new Date(event.start_at).toLocaleString("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Schedule TBA";

  const endDateStr = event.end_at
    ? new Date(event.end_at).toLocaleString("en-MY", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
        <Link href="/demo" className="hover:text-primary transition-colors">
          Storefront
        </Link>
        <span>/</span>
        <Link
          href="/demo/events"
          className="hover:text-primary transition-colors"
        >
          Events &amp; Passes
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{event.title}</span>
      </nav>

      {/* Main 12-Col Event Detail & Pass Selection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Hero Cover + Schedule & Venue Specifications */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden border border-outline-variant/60 shadow-md">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${event.imageUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00162e]/95 via-[#00162e]/45 to-transparent" />
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2">
              <Badge tone="teal">{event.category ?? "Campus Event"}</Badge>
              <span className="rounded-full bg-[#00162e]/90 text-white border border-white/15 px-3.5 py-1 text-label-sm font-bold">
                Instant QR Entry
              </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <p className="text-label-md text-[#5eead4] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  verified_user
                </span>
                Hosted by {org.name}
              </p>
              <h1 className="text-display font-bold text-white tracking-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Event Overview & Venue Specs */}
          <section className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 shadow-xs space-y-5">
            <div>
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                Event Overview
              </span>
              <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
                About This Event
              </h2>
              <p className="text-body-lg text-on-surface-variant mt-2 leading-relaxed">
                {event.description ??
                  "Official university event hosted by accredited student society leadership."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/40">
              <div className="rounded-xl bg-surface-low p-4 border border-outline-variant/40 space-y-1">
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    location_on
                  </span>
                  Campus Venue
                </span>
                <p className="text-headline-sm font-bold text-on-surface">
                  {event.venue ?? "Main Hall, Block C"}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Doors &amp; QR check-in open 45 mins prior
                </p>
              </div>

              <div className="rounded-xl bg-surface-low p-4 border border-outline-variant/40 space-y-1">
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    calendar_month
                  </span>
                  Date &amp; Time
                </span>
                <p className="text-body-md font-bold text-on-surface tabular-nums">
                  {startDateStr}
                </p>
                {endDateStr ? (
                  <p className="text-body-sm text-on-surface-variant tabular-nums">
                    Ends: {endDateStr}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Attendee Perks & Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-outline-variant/40 p-3 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  qr_code_2
                </span>
                <span className="text-label-sm text-on-surface">
                  Instant Digital QR Pass
                </span>
              </div>
              <div className="rounded-xl border border-outline-variant/40 p-3 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  shield
                </span>
                <span className="text-label-sm text-on-surface">
                  100% PayPal Protected
                </span>
              </div>
              <div className="rounded-xl border border-outline-variant/40 p-3 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  badge
                </span>
                <span className="text-label-sm text-on-surface">
                  Official Society Certificate
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right 5 Cols: Sticky Pass Tier Selector */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl border border-outline-variant/60 bg-surface-lowest p-6 shadow-md space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-outline-variant/40 pb-4">
            <div>
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                Official Box Office
              </span>
              <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
                Select Your Pass Tier
              </h2>
            </div>
            <Badge tone="success" icon="verified">
              Tickets Available
            </Badge>
          </div>

          {/* Capacity Utilization Meter */}
          <div className="rounded-xl bg-surface-low p-4 border border-outline-variant/45 tabular-nums space-y-1.5">
            <div className="flex items-center justify-between text-label-md">
              <span className="text-on-surface-variant">
                Seats Reserved
              </span>
              <span className="font-bold text-primary">
                {totalSold} / {cap} claimed ({pct}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Switch currency in the top bar to preview prices in your preferred currency.
            </p>
          </div>

          {/* Pass Tiers */}
          <div className="space-y-2.5">
            {event.tiers
              .filter((t) => t.quantity - t.sold > 0)
              .map((t) => (
                <TierBuyButton
                  key={t.id}
                  tier={{
                    tier_id: t.id,
                    name: `${event.title} — ${t.name}`,
                    price_cents: t.price_cents,
                    qty: 1,
                  }}
                  perks={t.perks}
                  remaining={t.quantity - t.sold}
                />
              ))}
          </div>

          <div className="pt-3 border-t border-outline-variant/40 flex flex-col gap-2">
            <Link
              href="/demo/cart"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 px-5 text-label-lg font-semibold text-on-primary hover:opacity-90 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                shopping_bag
              </span>
              <span>Review Bag &amp; Checkout</span>
            </Link>
            <Link
              href="/demo/shop"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-lowest py-2.5 px-4 text-label-md font-semibold text-on-surface hover:bg-surface-low transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                shopping_bag
              </span>
              <span>Bundle with Official Society Merch</span>
            </Link>
          </div>
        </aside>
      </div>

      {/* Other Upcoming Events */}
      {otherEvents.length > 0 ? (
        <section className="pt-6 border-t border-outline-variant/45 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-bold text-on-surface">
              More Upcoming Campus Events
            </h2>
            <Link
              href="/demo/events"
              className="text-label-md font-semibold text-secondary hover:underline"
            >
              View all events →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {otherEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/demo/events/${ev.slug}`}
                className="group rounded-2xl border border-outline-variant/50 bg-surface-lowest p-4 shadow-2xs hover:border-secondary/50 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <Badge tone="teal">{ev.category ?? "Event"}</Badge>
                  <h3 className="text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors mt-2">
                    {ev.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {ev.venue ?? "Campus Quad"}
                  </p>
                </div>
                <span className="text-label-sm font-semibold text-secondary">
                  View passes →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
