import { hasDatabaseEnv, getPool } from "@/lib/db";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Badge } from "@/components/ui/badge";
import { CartPill } from "@/components/store/cart-pill";
import { StoreGrid } from "@/components/store/store-grid";
import { TierBuyButton } from "@/components/store/tier-buy-button";
import { formatMoney } from "@/lib/money";
import { cacheLife, cacheTag } from "next/cache";

export const metadata = { title: "Storefront — CampusHub 2.0" };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  stock: number;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  category: string | null;
  start_at: string | null;
  tiers: {
    id: string;
    name: string;
    price_cents: number;
    quantity: number;
    sold: number;
  }[];
};

type StorefrontData = {
  org: { id: string; name: string; currency: string };
  products: ProductRow[];
  events: EventRow[];
};

/**
 * Public storefront data — vanilla SQL against the pool (public read paths:
 * first org, active products, published events with their tiers). Cached and
 * tagged "storefront"; the checkout API calls revalidateTag("storefront")
 * after a successful place_order so paid stock and sold counts go fresh.
 */
async function getStorefrontData(): Promise<StorefrontData | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("storefront");

  const pool = getPool();
  let orgRes, productsRes, eventsRes;
  try {
    [orgRes, productsRes, eventsRes] = await Promise.all([
      pool.query<{ id: string; name: string; currency: string }>(
        `select id, name, currency from public.organizations
         order by created_at asc limit 1`,
      ),
      pool.query<ProductRow>(
        `select id, name, slug, description, category, price_cents, stock
         from public.products
         where status = 'active'
         order by price_cents asc`,
      ),
      pool.query<
        EventRow & {
          tier_id: string | null;
          tier_name: string | null;
          tier_price_cents: number | null;
          tier_quantity: number | null;
          tier_sold: number | null;
        }
      >(
        `select e.id, e.title, e.description, e.venue, e.category, e.start_at,
                tt.id as tier_id, tt.name as tier_name, tt.price_cents as tier_price_cents,
                tt.quantity as tier_quantity, tt.sold as tier_sold
         from public.events e
         left join public.ticket_tiers tt on tt.event_id = e.id
         where e.status = 'published'
         order by e.start_at asc`,
      ),
    ]);
  } catch (err) {
    // Schema not applied yet (fresh database) or transient connection issue:
    // degrade to the setup notice instead of failing the build/prerender.
    console.error("storefront data unavailable", err);
    return null;
  }

  const org = orgRes.rows[0];
  if (!org) return null;

  // Fold the event×tier join rows back into nested tiers.
  const events: EventRow[] = [];
  const byEvent = new Map<string, EventRow>();
  for (const row of eventsRes.rows) {
    let e = byEvent.get(row.id);
    if (!e) {
      e = {
        id: row.id,
        title: row.title,
        description: row.description,
        venue: row.venue,
        category: row.category,
        start_at: row.start_at,
        tiers: [],
      };
      byEvent.set(row.id, e);
      events.push(e);
    }
    if (row.tier_id) {
      e.tiers.push({
        id: row.tier_id,
        name: row.tier_name ?? "",
        price_cents: row.tier_price_cents ?? 0,
        quantity: row.tier_quantity ?? 0,
        sold: row.tier_sold ?? 0,
      });
    }
  }

  return {
    org: { id: org.id, name: org.name, currency: org.currency },
    products: productsRes.rows,
    events,
  };
}

export default async function DemoStorefront() {
  // Env-missing branch stays uncached so a fresh deploy with env vars
  // picked up later is not shadowed by a cached setup notice.
  if (!hasDatabaseEnv()) return <SetupNotice what="the storefront" />;

  const data = await getStorefrontData();
  if (!data) return <SetupNotice what="store data" />;

  const { org } = data;
  const products = data.products;
  const events = data.events;

  return (
    <main className="w-full bg-surface">
      {/* Ambient glow layer (Stitch hero) */}
      <div className="relative w-full overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-96 bg-secondary-fixed/15 blur-3xl pointer-events-none rounded-full"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
          {/* Hero split */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center py-space-xl">
            <div className="lg:col-span-6 flex flex-col gap-space-md z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/30 w-fit">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="font-label-sm text-label-sm font-semibold tracking-wide uppercase text-secondary">
                    {org.name}
                  </span>
                </div>
                <CartPill />
              </div>
              <h1 className="font-headline-lg text-headline-lg lg:text-[44px] lg:leading-[52px] tracking-tight text-primary font-bold">
                Discover, Shop and Join{" "}
                <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
                  Campus Life
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Official campus events, student club merchandise, and society
                tickets. Guest checkout with PayPal — no account needed.
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <a
                  href="#events"
                  className="px-6 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs group"
                >
                  <span>Explore Events</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </a>
                <a
                  href="#merch"
                  className="px-6 py-3 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg text-label-lg font-semibold ring-1 ring-outline-variant/40 shadow-sm transition-all flex items-center gap-space-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    storefront
                  </span>
                  <span>Browse Marketplace</span>
                </a>
              </div>
              <div className="flex items-center gap-space-sm pt-space-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm ring-1 ring-outline-variant/20">
                  <span aria-hidden>🔥</span>
                  <span className="font-semibold text-primary">
                    {events.length} active events
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span>{products.length} club items</span>
                </div>
              </div>
            </div>
          </section>

          <section id="events" className="pb-space-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
              Upcoming events
            </h2>
            {events.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">
                No published events yet.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {events.map((e) => {
                  const cheapest = e.tiers
                    ?.filter((t) => t.quantity - t.sold > 0)
                    .sort((a, b) => a.price_cents - b.price_cents)[0];
                  const start = e.start_at
                    ? new Date(e.start_at).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;
                  return (
                    <article
                      key={e.id}
                      className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        {e.category ? (
                          <Badge tone="teal">{e.category}</Badge>
                        ) : (
                          <span />
                        )}
                        <span className="text-label-sm text-on-surface-variant">
                          {start}
                        </span>
                      </div>
                      <h3 className="text-headline-sm text-on-surface mt-3">
                        {e.title}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                        {e.description}
                      </p>
                      {e.venue ? (
                        <p className="text-label-md text-on-surface-variant mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            location_on
                          </span>
                          {e.venue}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between">
                        {cheapest ? (
                          <span className="text-body-sm text-on-surface-variant">
                            from{" "}
                            <strong className="text-on-surface">
                              {formatMoney(cheapest.price_cents, org.currency)}
                            </strong>
                          </span>
                        ) : (
                          <Badge tone="warning">Sold out</Badge>
                        )}
                      </div>
                      {e.tiers?.length ? (
                        <div className="mt-3 space-y-2 border-t border-outline-variant pt-3">
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
                              />
                            ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section id="merch" className="pb-space-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
              Merch
            </h2>
            <StoreGrid products={products} currency={org.currency} />
          </section>
        </div>
      </div>
    </main>
  );
}
