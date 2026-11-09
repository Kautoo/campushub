import Link from "next/link";
import { hasDatabaseEnv } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/session";
import { SetupNotice } from "@/components/layout/setup-notice";
import { TierBuyButton } from "@/components/store/tier-buy-button";
import { StorePrice } from "@/components/store/currency-provider";
import { Badge } from "@/components/ui/badge";
import { StorefrontBanner } from "@/components/store/storefront-banner";
import { getStorefrontData, STITCH_EVENT_IMAGES } from "@/lib/storefront";
export const metadata = {
  title: "Campus Events & Digital Passes — CampusHub Storefront",
};

export default async function DemoEventsCatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ org?: string; preview?: string }>;
}) {
  if (!hasDatabaseEnv()) return <SetupNotice what="the events catalog" />;

  const params = await searchParams;
  let targetOrg = params?.org;
  if (!targetOrg && params?.preview === "1") {
    const session = await getSessionContext();
    if (session?.orgIds?.[0]) {
      targetOrg = session.orgIds[0];
    }
  }
  const data = await getStorefrontData(targetOrg);
  if (!data) return <SetupNotice what="events data" />;
  const { org, events } = data;
  const totalSeats = events.reduce((s, e) => s + (e.capacity || 0), 0);
  const totalSold = events.reduce(
    (s, e) => s + e.tiers.reduce((ts, t) => ts + t.sold, 0),
    0,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <StorefrontBanner
        orgName={org.name}
        isCustomOrg={org.isCustomOrg}
      />
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 sm:p-8 shadow-xs space-y-4">
        <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Link href="/demo" className="hover:text-primary transition-colors">
            Storefront
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">
            Events &amp; Digital Passes
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge tone="teal" icon="confirmation_number">
                Instant QR Ticketing
              </Badge>
              <Badge tone="primary">{events.length} Upcoming Events</Badge>
            </div>
            <h1 className="text-display font-bold text-on-surface tracking-tight">
              Campus Events &amp; Society Pass Lineup
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Browse verified university conferences, 48-hour hackathons, ML
              bootcamps, and career fairs. Select your pass tier below or open
              any event page for full venue and schedule details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <div className="rounded-xl border border-outline-variant/50 bg-surface-low px-4 py-2.5">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Students Registered
              </span>
              <span className="text-headline-sm font-bold text-primary">
                {totalSold.toLocaleString()} / {totalSeats.toLocaleString()} seats
              </span>
            </div>
            <Link
              href="/demo/cart"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                shopping_bag
              </span>
              <span>View Bag &amp; Checkout</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-6">
        {events.map((e) => {
          const sold = e.tiers.reduce((s, t) => s + t.sold, 0);
          const cap = e.capacity || 100;
          const pct = Math.min(100, Math.round((sold / cap) * 100));
          const cheapest = e.tiers
            .filter((t) => t.quantity - t.sold > 0)
            .sort((a, b) => a.price_cents - b.price_cents)[0];

          return (
            <article
              key={e.id}
              className="rounded-2xl border border-outline-variant/50 bg-surface-lowest shadow-xs hover:border-secondary/50 transition-all overflow-hidden grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Left 5 Cols: Event Visual */}
              <Link
                href={`/demo/events/${e.slug}`}
                className="lg:col-span-5 relative min-h-[240px] bg-surface-low overflow-hidden block group"
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#00162e]/95 via-[#00162e]/40 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge tone="teal">{e.category ?? "Event"}</Badge>
                  <span className="rounded-full bg-[#00162e]/90 text-white border border-white/15 px-3 py-1 text-label-sm font-semibold tabular-nums">
                    {e.start_at
                      ? new Date(e.start_at).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Upcoming"}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-label-sm text-[#5eead4] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">
                      location_on
                    </span>
                    {e.venue ?? "Campus Quad"}
                  </p>
                  <h2 className="text-headline-md font-bold text-white mt-0.5">
                    {e.title}
                  </h2>
                </div>
              </Link>

              {/* Right 7 Cols: Details & Pass Tiers */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        verified_user
                      </span>
                      <span>Hosted by {org.name}</span>
                      <span>•</span>
                      <span className="tabular-nums">
                        From{" "}
                        <strong className="text-primary">
                          {cheapest ? (
                            <StorePrice cents={cheapest.price_cents} />
                          ) : (
                            "Free"
                          )}
                        </strong>
                      </span>
                    </div>
                    <Link
                      href={`/demo/events/${e.slug}`}
                      className="inline-flex items-center gap-1 text-label-md font-semibold text-secondary hover:underline"
                    >
                      <span>View Event Details</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>

                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {e.description}
                  </p>

                  {/* Capacity Bar */}
                  <div className="rounded-xl bg-surface-low p-3 border border-outline-variant/40 tabular-nums">
                    <div className="flex items-center justify-between text-label-sm mb-1">
                      <span className="text-on-surface-variant">
                        Seat Availability
                      </span>
                      <span className="font-bold text-on-surface">
                        {sold} / {cap} seats claimed ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tiers */}
                <div className="space-y-2">
                  <span className="text-label-sm uppercase tracking-wider font-bold text-on-surface-variant block">
                    Select Pass Tier ({e.tiers.length})
                  </span>
                  <div className="grid grid-cols-1 gap-2">
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
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
