import { hasSupabaseEnv } from "@/lib/supabase/safe";
import { supabasePublic } from "@/lib/supabase/client";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Badge } from "@/components/ui/badge";
import { CartPill } from "@/components/store/cart-pill";
import { StoreGrid } from "@/components/store/store-grid";
import { TierBuyButton } from "@/components/store/tier-buy-button";
import type { CartLine } from "@/components/store/cart";
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
  tiers: { id: string; name: string; price_cents: number; quantity: number; sold: number }[];
};

type StorefrontData = {
  org: { id: string; name: string; currency: string };
  products: ProductRow[];
  events: EventRow[];
};

/**
 * Public storefront data via the cookie-less anon client (same RLS as a
 * guest visitor). Cached and tagged "storefront"; the checkout API calls
 * revalidateTag("storefront") after a successful place_order so paid
 * stock and sold counts go fresh.
 */
async function getStorefrontData(): Promise<StorefrontData | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("storefront");

  const supabase = supabasePublic();

  const [orgsRes, productsRes, eventsRes] = await Promise.all([
    supabase.from("organizations").select("id, name, currency").limit(1),
    supabase
      .from("products")
      .select("id, name, slug, description, category, price_cents, stock")
      .eq("status", "active")
      .order("price_cents"),
    supabase
      .from("events")
      .select(
        "id, title, description, venue, category, start_at, ticket_tiers(id, name, price_cents, quantity, sold)",
      )
      .eq("status", "published")
      .order("start_at"),
  ]);

  const org = orgsRes.data?.[0];
  if (!org) return null;

  return {
    org: { id: org.id, name: org.name, currency: org.currency },
    products: (productsRes.data ?? []) as ProductRow[],
    events: (eventsRes.data ?? []) as unknown as EventRow[],
  };
}

export default async function DemoStorefront() {
  // Env-missing branch stays uncached so a fresh deploy with env vars
  // picked up later is not shadowed by a cached setup notice.
  if (!hasSupabaseEnv()) return <SetupNotice what="the storefront" />;

  const data = await getStorefrontData();
  if (!data) return <SetupNotice what="store data" />;

  const { org } = data;
  const products = data.products;
  const events = data.events;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-label-md text-muted">{org.name}</p>
          <h1 className="text-display text-ink">Campus store</h1>
          <p className="text-body-lg text-muted mt-1 max-w-xl">
            Merch and event tickets. Guest checkout with PayPal — no account
            needed.
          </p>
        </div>
        <CartPill />
      </div>

      <section id="events" className="mb-12">
        <h2 className="text-headline-md text-ink mb-4">Upcoming events</h2>
        {events.length === 0 ? (
          <p className="text-body-md text-muted">No published events yet.</p>
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
                  className="rounded-xl border border-outline-variant bg-surface-lowest p-5 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    {e.category ? (
                      <Badge tone="teal">{e.category}</Badge>
                    ) : (
                      <span />
                    )}
                    <span className="text-label-sm text-muted">{start}</span>
                  </div>
                  <h3 className="text-headline-sm text-ink mt-3">{e.title}</h3>
                  <p className="text-body-sm text-muted mt-1 line-clamp-2">
                    {e.description}
                  </p>
                  {e.venue ? (
                    <p className="text-label-md text-muted mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      {e.venue}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between">
                    {cheapest ? (
                      <span className="text-body-sm text-muted">
                        from{" "}
                        <strong className="text-ink">
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

      <section>
        <h2 className="text-headline-md text-ink mb-4">Merch</h2>
        <StoreGrid
          products={products}
          currency={org.currency}
        />
      </section>
    </main>
  );
}
