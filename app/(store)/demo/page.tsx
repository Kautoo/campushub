import { hasDatabaseEnv, getPool } from "@/lib/db";
import { SetupNotice } from "@/components/layout/setup-notice";
import { CartPill } from "@/components/store/cart-pill";
import { StoreGrid, type StoreProduct } from "@/components/store/store-grid";
import { TierBuyButton } from "@/components/store/tier-buy-button";
import { formatMoney } from "@/lib/money";
import { cacheLife, cacheTag } from "next/cache";

export const metadata = { title: "Storefront & Marketplace — CampusHub 2.0" };

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  category: string | null;
  start_at: string | null;
  imageUrl?: string;
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
  products: StoreProduct[];
  events: EventRow[];
};

// Stitch event photography mapping for high visual fidelity
const STITCH_EVENT_IMAGES: Record<string, string> = {
  "innovation-week-2026":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkGKgKw6VSLV0diILC4W0PfrGA6B9tq3jZvcSkvYE9S-VMbx9vHq9gLKNJFuehPV1U14V8WZ88g0iA-NYbFxes0na0xc1rWe48QTJbfLihpw0Uig8fud1sKPutN7SWTPsgSBON6fsK7fJPkVv8CHMssuaagJUbhC5WMd_qjetlBZ5sZACYCxY6gcvav64SCCvwYRwz5WwLtJZpezsCBAACb_vysbBhFVM8GQepBVJF",
  "hack-the-campus-48h":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBX0_sC-dBDNzTjGeMvufMkk8Qg4WCPEPsmdaK5iRrCO-8z86fjhpzEVkuy7Gj7kT7qQ8-3WEfilcspSo_Uz3Zv7-Gfw6izdmC8wl86RyHShaaOH2_SrPzBq4msM5CtHppM38HmdR69cueX_91mXhTqcQr9gE7ELh1pXl4IRsMDYso5hu9xNIlmrqeoSiPrxLZKpiII6JXtdD2DmQ79_SZU2E83M-ka5ILxlIobnOwT",
  "ai-ml-bootcamp":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPnnJOUxuHtxBaAWqdc6D93UZ9eJ9rcbZK_lBiyj2jGcF92Zp2TtpviuATHuZwSkn6qFA5lNlKVNO79FwkV13w0VoN4siz_KgZZXQpt3BzQmZRpBIOoBnd3HfJB6TAcvBCd3w-F1ZoPIYz9RnbwQ7hERL4UnsXS_fnR58f25BGnNO2KLF2sWOIvsnEJRU_cMqevtsnz7WmPvF8RHBKgMj6f01uEH5Copxxsx97S__",
  "startup-career-fair":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD0B52QC0MXKLYsgDYceb5ZlJ3LwKx8vxRjsPNEyTqZywg54BlqLkIV66RMBjQ6Pyf0_pIwKirQjVQQI7akm96YiJsISqXiTT1ZlpS44QylONJFRaDPn6EGb_8dtxpKrjGzmAqj6v_rnL05ckQb-muRqQpE78oj4b89iuHLIZxSEh_0SyJYf0fRuBPp1DsHbc4X5c9TCLYzEePP-S5IhWPdbPeP0fJwvq_71mjlcBI6",
  "cybersecurity-night":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBfg4nSH4ImbNw_beLGvmzVsh5puf-o_2gDfLVVimRL3fzDc2tLc_kX1Fyoe8LeqYN0ySRi8PCcIotw5FhDHtNUt3sFGBG1oVAiJ17xr2jzPwsDnJlBHTup78L3WeO6czQ92PGk-HNWvfD2M0G29DJW6W7Eq0lC3cvvbPkj9wEPO1A2eSZGH7xFW3m32d7dPvRxZ_evOWAuJ4obMJPmVwhsisEumYwJu0f_Rf8Q5UPO",
};

const CATEGORIES = [
  { label: "All Categories", icon: "apps" },
  { label: "Hackathons & Tech", icon: "terminal" },
  { label: "Club Merch", icon: "shopping_bag" },
  { label: "Arts & Culture", icon: "palette" },
  { label: "Workshops", icon: "school" },
  { label: "Sports & Esports", icon: "sports_esports" },
];

/**
 * Public storefront data — cached and tagged "storefront".
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
      pool.query<StoreProduct>(
        `select id, name, slug, description, images, category, price_cents, stock
         from public.products
         where status = 'active'
         order by price_cents asc`,
      ),
      pool.query<
        EventRow & {
          slug: string;
          tier_id: string | null;
          tier_name: string | null;
          tier_price_cents: number | null;
          tier_quantity: number | null;
          tier_sold: number | null;
        }
      >(
        `select e.id, e.title, e.slug, e.description, e.venue, e.category, e.start_at,
                tt.id as tier_id, tt.name as tier_name, tt.price_cents as tier_price_cents,
                tt.quantity as tier_quantity, tt.sold as tier_sold
         from public.events e
         left join public.ticket_tiers tt on tt.event_id = e.id
         where e.status = 'published'
         order by e.start_at asc`,
      ),
    ]);
  } catch (err) {
    console.error("storefront data unavailable", err);
    return null;
  }

  const org = orgRes.rows[0];
  if (!org) return null;

  const byEvent = new Map<string, EventRow>();
  const events: EventRow[] = [];
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
        imageUrl:
          STITCH_EVENT_IMAGES[row.slug] ||
          STITCH_EVENT_IMAGES["innovation-week-2026"],
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
  if (!hasDatabaseEnv()) return <SetupNotice what="the storefront" />;

  const data = await getStorefrontData();
  if (!data) return <SetupNotice what="store data" />;

  const { org, products, events } = data;
  const flagship = events[0];

  return (
    <main className="w-full bg-surface min-h-screen">
      {/* ============================================================
          1. HERO & FEATURED EVENT SHOWCASE (1:1 with Stitch Section 1)
          ============================================================ */}
      <div className="relative w-full overflow-hidden border-b border-outline-variant/30">
        {/* Ambient Top Glow Layer */}
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-96 bg-gradient-to-r from-secondary/15 via-secondary-container/20 to-primary-fixed-dim/20 blur-3xl pointer-events-none rounded-full"
        />

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-space-xl lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            {/* Left: Value Proposition */}
            <div className="lg:col-span-6 flex flex-col gap-space-md z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/30 w-fit">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="font-label-sm text-label-sm font-semibold tracking-wide uppercase text-secondary">
                    CampusHub 2.0
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Higher Ed Commerce Ecosystem
                  </span>
                </div>
                <CartPill />
              </div>

              <h1 className="font-headline-lg text-headline-lg lg:text-[44px] lg:leading-[52px] tracking-tight text-primary font-bold">
                Discover, Shop and Join{" "}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-secondary to-on-tertiary-container bg-clip-text text-transparent">
                  Campus Life
                </span>
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Your all-in-one verified platform for official campus events,
                student club merchandise, society memberships, and
                faculty-approved workshops.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <a
                  href="#events-section"
                  className="px-6 py-3 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs group"
                >
                  <span>Explore Events</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </a>
                <a
                  href="#merch-section"
                  className="px-6 py-3 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg text-label-lg font-semibold ring-1 ring-outline-variant/40 shadow-sm transition-all flex items-center gap-space-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    storefront
                  </span>
                  <span>Browse Marketplace</span>
                </a>
              </div>

              {/* Micro Metric Pill */}
              <div className="flex items-center gap-space-sm pt-space-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm ring-1 ring-outline-variant/20">
                  <span className="text-base">🔥</span>
                  <span className="font-semibold text-primary">
                    {events.length} active events
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span>{products.length} club items</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden items-center pl-1">
                  <div className="w-6 h-6 rounded-full bg-primary-fixed-dim text-primary flex items-center justify-center font-label-sm text-[10px] ring-2 ring-surface">
                    TS
                  </div>
                  <div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-container flex items-center justify-center font-label-sm text-[10px] ring-2 ring-surface">
                    CS
                  </div>
                  <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-container flex items-center justify-center font-label-sm text-[10px] ring-2 ring-surface">
                    EE
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Flagship Card (1:1 with Stitch Innovation Week Card) */}
            <div className="lg:col-span-6">
              <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest shadow-xl ring-1 ring-outline-variant/30 group">
                <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                      backgroundImage: `url('${
                        flagship?.imageUrl ||
                        STITCH_EVENT_IMAGES["innovation-week-2026"]
                      }')`,
                    }}
                  />
                  {/* Dark Scrim Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        verified
                      </span>
                      Flagship Event
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary/90 backdrop-blur-md text-on-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        bolt
                      </span>
                      Early Bird Active
                    </span>
                  </div>

                  {/* Card Bottom Details */}
                  <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col gap-space-sm text-on-primary">
                    <div className="flex items-center gap-2 font-label-sm text-label-sm text-secondary-fixed font-semibold tracking-wide uppercase">
                      <span className="material-symbols-outlined text-[16px]">
                        calendar_month
                      </span>
                      MAR 10 - MAR 14, 2026
                      <span>•</span>
                      <span>{flagship?.venue ?? "Great Hall & Quad"}</span>
                    </div>

                    <h3 className="font-headline-lg text-headline-lg font-bold text-on-primary leading-snug">
                      {flagship?.title ?? "Campus Innovation Week 2026"}
                    </h3>

                    <p className="font-body-sm text-body-sm text-on-primary-container line-clamp-2">
                      {flagship?.description ??
                        "5 days of hackathons, student venture pitches, keynote industry panels, and society recruitment exhibitions."}
                    </p>

                    <div className="pt-space-xs flex items-center justify-between gap-space-md border-t border-on-primary/10">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-tertiary-fixed animate-ping" />
                        <span className="font-label-sm text-label-sm text-on-primary font-medium">
                          +420 Registered • Limited Seats
                        </span>
                      </div>
                      <a
                        href="#events-section"
                        className="px-5 py-2 rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center gap-1 shrink-0"
                      >
                        <span>Register Pass</span>
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================
          2. DIRECTORY / CATEGORY CHIPS (1:1 with Stitch Section 2)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-space-lg w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm mb-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Directory
            </span>
            <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
              Browse by Category
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Quickly filter between verified campus tickets, apparel,
              supplies, and society activities.
            </p>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all shadow-xs ${
                i === 0
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================
          3. UPCOMING CAMPUS EVENTS (1:1 with Stitch Section 3)
          ============================================================ */}
      <section
        id="events-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-space-xl w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Ticketing &amp; Gateway
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
              Upcoming Campus Events
            </h2>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="font-label-lg text-label-lg font-semibold text-secondary flex items-center gap-0.5">
              <span>{events.length} Active Events</span>
            </span>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          {events.map((e) => {
            const cheapest = e.tiers
              ?.filter((t) => t.quantity - t.sold > 0)
              .sort((a, b) => a.price_cents - b.price_cents)[0];
            const startFormatted = e.start_at
              ? new Date(e.start_at).toLocaleDateString("en-MY", {
                  month: "short",
                  day: "numeric",
                })
              : "Upcoming";

            return (
              <div
                key={e.id}
                className="group rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/30 hover:ring-secondary/40 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden"
              >
                {/* Event Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-surface-container-low">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('${
                        e.imageUrl ||
                        STITCH_EVENT_IMAGES["innovation-week-2026"]
                      }')`,
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold shadow-xs">
                      {e.category ?? "Event"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary font-label-sm text-label-sm font-medium drop-shadow-md">
                    <span className="flex items-center gap-1 bg-primary/75 px-2 py-0.5 rounded backdrop-blur-xs">
                      <span className="material-symbols-outlined text-[14px]">
                        calendar_today
                      </span>
                      {startFormatted}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-space-md flex-1 flex flex-col justify-between gap-space-sm">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        verified_user
                      </span>
                      {org.name}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-primary mt-1 line-clamp-1 group-hover:text-secondary transition-colors">
                      {e.title}
                    </h3>
                    {e.venue ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          location_on
                        </span>
                        <span>{e.venue}</span>
                      </p>
                    ) : null}
                  </div>

                  {/* Price & Buy Buttons */}
                  <div className="pt-space-xs border-t border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        from
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">
                        {cheapest
                          ? formatMoney(cheapest.price_cents, org.currency)
                          : "Free Entry"}
                      </span>
                    </div>
                    {e.tiers?.length ? (
                      <div className="flex flex-col gap-1.5">
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          4. OFFICIAL MERCHANDISE (1:1 with Stitch Section 4)
          ============================================================ */}
      <section
        id="merch-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-space-xl w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Campus Storefront
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
              Collegiate Store &amp; Official Merchandise
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Support student societies with faculty-licensed apparel, stickers,
              and gear.
            </p>
          </div>
        </div>

        <StoreGrid products={products} currency={org.currency} />
      </section>

      {/* ============================================================
          5. FEATURED CAMPUS ORGANIZATIONS (1:1 with Stitch Section 5)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-space-xl w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Accredited Student Bodies
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-primary">
              Featured Campus Organizations
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Meet the accredited university clubs and societies hosting this
              semester&apos;s biggest initiatives.
            </p>
          </div>
        </div>

        {/* 3 Society Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Society 1: Tech Society */}
          <div className="rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/30 hover:ring-secondary/40 shadow-sm hover:shadow-md transition-all p-space-lg flex flex-col justify-between">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="w-14 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-headline-md shadow-sm">
                  <span className="material-symbols-outlined text-[30px] text-secondary-fixed">
                    terminal
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  Tier 1 Club
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">
                  Tech Society
                </h3>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">
                  Faculty of Computer Science
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Organizers of annual hackathons, algorithmic code sprints, and
                  open-source developer collectives.
                </p>
              </div>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>480 Active Members</span>
              <span>14 Events Hosted</span>
            </div>
          </div>

          {/* Society 2: Design Guild */}
          <div className="rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/30 hover:ring-secondary/40 shadow-sm hover:shadow-md transition-all p-space-lg flex flex-col justify-between">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-headline-md shadow-sm">
                  <span className="material-symbols-outlined text-[30px] text-tertiary-fixed">
                    palette
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  Creative Partner
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">
                  Design &amp; Multimedia Guild
                </h3>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">
                  Creative Media Faculty
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  UI/UX workshops, motion graphic showcases, and design
                  thinking symposiums for digital creators.
                </p>
              </div>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>310 Active Members</span>
              <span>8 Exhibitions</span>
            </div>
          </div>

          {/* Society 3: Sports Council */}
          <div className="rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/30 hover:ring-secondary/40 shadow-sm hover:shadow-md transition-all p-space-lg flex flex-col justify-between">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="w-14 h-14 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold text-headline-md shadow-sm">
                  <span className="material-symbols-outlined text-[30px] text-primary">
                    sports_esports
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  Council Body
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">
                  Sports &amp; Athletics Council
                </h3>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">
                  University Sports Complex
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Inter-faculty sports championships, varsity tournaments, and
                  collegiate esports leagues.
                </p>
              </div>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>620 Student Athletes</span>
              <span>24 Tournaments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. PROTECTED COLLEGIATE COMMERCE STANDARD (1:1 with Stitch Section 6)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-space-lg mb-space-xl w-full">
        <div className="rounded-3xl bg-primary text-on-primary p-space-xl shadow-xl relative overflow-hidden">
          {/* Ambient Backlights */}
          <div
            aria-hidden
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-tertiary-fixed/10 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col gap-space-lg">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest/15 text-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Campus Guarantee
              </span>
              <h3 className="font-headline-lg text-headline-lg lg:text-3xl font-bold mt-2 text-white">
                Protected Collegiate Commerce Standard
              </h3>
              <p className="font-body-md text-body-md text-on-primary-container mt-1">
                Every transaction, ticket scan, and apparel order is directly
                integrated with verified university bursary accounts and student
                registry services.
              </p>
            </div>

            {/* 4 Key Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
              <div className="p-space-md rounded-2xl bg-surface-container-lowest/10 backdrop-blur-sm border border-on-primary/10 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed/20 text-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    shield
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-primary">
                  100% Fund Protection
                </h4>
                <p className="font-body-sm text-body-sm text-on-primary-container leading-snug">
                  Student funds are escrowed directly into verified bursary
                  accounts with PayPal security.
                </p>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest/10 backdrop-blur-sm border border-on-primary/10 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed/20 text-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    qr_code_2
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-primary">
                  Instant QR Entry
                </h4>
                <p className="font-body-sm text-body-sm text-on-primary-container leading-snug">
                  Encrypted dynamic tickets with rapid check-in gate scanning
                  and duplicate prevention.
                </p>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest/10 backdrop-blur-sm border border-on-primary/10 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed/20 text-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    badge
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-primary">
                  Verified Identities
                </h4>
                <p className="font-body-sm text-body-sm text-on-primary-container leading-snug">
                  Matriculation ID authentication prevents scalping and secures
                  student society allocations.
                </p>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest/10 backdrop-blur-sm border border-on-primary/10 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed/20 text-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    savings
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-primary">
                  Student Pricing
                </h4>
                <p className="font-body-sm text-body-sm text-on-primary-container leading-snug">
                  Tiered society discounts and subsidized member passes for
                  affordable campus experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
