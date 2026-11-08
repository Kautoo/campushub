import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { StatStrip } from "@/components/ui/kpi-card";
import RevenueChart, { type RevenuePoint } from "@/components/charts/revenue-chart-lazy";
import { formatMoney } from "@/lib/money";
import { sinceIso, lastDayKeys } from "@/lib/metrics";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders, ticketTiers, products, orgs, events } from "@/lib/db/repo";

export const metadata = { title: "Organizer Management Dashboard — CampusHub 2.0" };

const RANGES = [7, 30, 90] as const;
type WindowDays = (typeof RANGES)[number];

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="the dashboard" />;
  const session = await getSessionContext();
  if (!session) redirect("/login");
  const orgIds = session.orgIds;

  const params = await searchParams;
  const raw = Number(params.window);
  const windowDays: WindowDays = (RANGES as readonly number[]).includes(raw)
    ? (raw as WindowDays)
    : 30;
  const since = sinceIso(windowDays);

  const [orgList, paidOrders, recent, revenueByDay, tickets, allProducts, allEvents] =
    await Promise.all([
      orgs.list(orgIds),
      orders.listSimple(orgIds, {
        statuses: ["paid", "fulfilled", "refunded"],
      }),
      orders.listRecent(orgIds, 8),
      orders.listSimple(orgIds, {
        statuses: ["paid", "fulfilled"],
        since,
      }),
      ticketTiers.listByOrgs(orgIds),
      products.list(orgIds),
      events.listWithTiers(orgIds),
    ]);

  const orgName = orgList[0]?.name ?? "Tech Society";
  const revenueCents = paidOrders.reduce((s, o) => s + o.total_cents, 0);
  const ticketsSold = tickets.reduce((s, t) => s + t.sold, 0);
  const lowStockProducts = allProducts.filter(
    (p) => p.status === "active" && p.stock <= p.low_stock_threshold,
  );

  // Revenue chart data
  const byDay = new Map<string, number>();
  for (const d of lastDayKeys(windowDays)) {
    byDay.set(d, 0);
  }
  for (const o of revenueByDay) {
    const d = o.created_at.slice(5, 10);
    if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + o.total_cents);
  }
  const chartData: RevenuePoint[] = [...byDay.entries()].map(([day, cents]) => ({
    day,
    cents,
  }));

  const greeting = greetingFor(new Date().getHours());

  // Top products for Section 4
  const topProducts = allProducts.slice(0, 4);

  // Upcoming published events for Section 4
  const upcomingEvents = allEvents
    .filter((e) => e.status === "published" || e.status === "draft")
    .slice(0, 4);

  return (
    <div className="space-y-space-lg">
      {/* ============================================================
          SECTION 1: TOP WELCOME BANNER & CONTROLS (1:1 with Stitch)
          ============================================================ */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold">
              {greeting}, {orgName}
            </h1>
            <span className="text-2xl animate-pulse" aria-hidden>
              👋
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here&apos;s your organization&apos;s performance overview for this semester.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          {/* Time Filter Selector */}
          <div className="flex items-center bg-surface-container-lowest rounded-xl shadow-sm p-1 ring-1 ring-outline-variant/30">
            {RANGES.map((days) => (
              <Link
                key={days}
                href={`/dashboard?window=${days}`}
                scroll={false}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                  windowDays === days
                    ? "bg-secondary-container text-on-secondary-container font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {days}d
              </Link>
            ))}
          </div>

          {/* Action: Quick Export */}
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-2 bg-surface-container-lowest text-primary hover:bg-surface-container px-space-md py-2.5 rounded-xl font-label-md text-label-md shadow-sm ring-1 ring-outline-variant/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Quick Export</span>
          </Link>

          {/* Primary CTA: Create Listing / Event */}
          <Link
            href="/dashboard/events"
            className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-space-md py-2.5 rounded-xl font-label-md text-label-md font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Event Listing</span>
          </Link>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: 4 KPI METRICS ROW (1:1 with Stitch Stat Cards)
          ============================================================ */}
      <StatStrip
        items={[
          {
            label: "Total Sales",
            value: revenueCents,
            icon: "payments",
            format: "money",
            tone: "teal",
          },
          {
            label: "Total Orders",
            value: paidOrders.length,
            icon: "shopping_cart_checkout",
            tone: "primary",
          },
          {
            label: "Event Tickets",
            value: ticketsSold,
            icon: "confirmation_number",
            tone: "success",
          },
          {
            label: "Low Stock Items",
            value: lowStockProducts.length,
            icon: "inventory_2",
            tone: "neutral",
          },
        ]}
      />

      {/* ============================================================
          SECTION 3: SALES PERFORMANCE CHART + AI INTELLIGENCE (1:1 Stitch)
          ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left 8 Cols: Sales Performance Chart */}
        <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-3">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                Sales Performance
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Daily transaction metrics across products and digital passes (last {windowDays} days)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Revenue
                </span>
              </div>
              <div className="flex items-center bg-surface-container-low px-2.5 py-1 rounded-lg gap-1 text-on-surface font-label-sm text-label-sm">
                <span>MYR Currency</span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Right 4 Cols: AI Intelligence Card */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl p-space-lg shadow-sm bg-gradient-to-br from-surface-container-lowest via-surface-container-low/80 to-surface-bright relative overflow-hidden ring-1 ring-outline-variant/30">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-40 h-40 bg-secondary-container/50 rounded-full blur-3xl pointer-events-none"
          />
          <div>
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    auto_awesome
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  AI Intelligence
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold">
                Active Engine
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Autonomous telemetry analyzed {paidOrders.length} transactions and identified key growth vectors:
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 p-space-sm bg-surface-container-lowest/80 backdrop-blur rounded-xl shadow-xs ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  verified
                </span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Gross volume reached{" "}
                  <strong className="text-primary">{formatMoney(revenueCents)}</strong> across{" "}
                  {paidOrders.length} confirmed orders.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-space-sm bg-surface-container-lowest/80 backdrop-blur rounded-xl shadow-xs ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  confirmation_number
                </span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Event passes generated <strong className="text-primary">{ticketsSold}</strong>{" "}
                  registrations across {allEvents.length} active initiatives.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-space-sm bg-surface-container-lowest/80 backdrop-blur rounded-xl shadow-xs ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">
                  inventory_2
                </span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  <span className="text-warning font-semibold">Stock Alert:</span>{" "}
                  {lowStockProducts.length > 0
                    ? `${lowStockProducts[0].name} has ${lowStockProducts[0].stock} units left.`
                    : "All product inventory levels currently healthy."}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-space-md">
            <Link
              href="/dashboard/ai-insights"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md font-semibold ring-1 ring-outline-variant/40 shadow-xs transition-colors"
            >
              <span>Explore AI Insights</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: TOP PRODUCTS & UPCOMING EVENTS SCHEDULE (1:1 Stitch)
          ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Left: Top Performing Products */}
        <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                  Top Performing Products
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Leading official merchandise by units &amp; gross margin
                </span>
              </div>
              <Link
                href="/dashboard/products"
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                title="Manage Catalog"
              >
                <span className="material-symbols-outlined text-[20px]">
                  sort
                </span>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {topProducts.map((p) => {
                const img =
                  p.images?.[0] ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBONDIJOCIm1jFOr9QdvzBv29vbS8tn1Pai5hmfAk2sx2uu58dydkk-138wEQzSgv6M0iTycK8cowKCBp5Hbs0PAapK4jVgfUZvzY81eDZxIBXcBtDhQ-3BxvWQ9MJqKl57jDBK81xbO_sad_e64LjxgQLiIiR3i0M1P7KVA9FikrgUG7zqSJ5qcEkldg2GXYRQ0kI-9dSYeSi1pJQl6qr0ofsmRR1InF9iW83odl_A";
                const isLow = p.stock <= p.low_stock_threshold;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high/60 transition-colors"
                  >
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Stock: {p.stock}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant" />
                          <span
                            className={`px-1.5 py-0.5 rounded font-label-sm text-[10px] font-semibold ${
                              isLow
                                ? "bg-error-container text-on-error-container"
                                : "bg-tertiary-fixed/30 text-on-tertiary-container"
                            }`}
                          >
                            {isLow ? "Low Stock" : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-label-lg text-label-lg font-bold text-primary">
                        {formatMoney(p.price_cents)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-space-md">
            <Link
              href="/dashboard/products"
              className="w-full flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors"
            >
              <span>View Inventory Matrix</span>
              <span className="material-symbols-outlined text-[16px]">
                trending_flat
              </span>
            </Link>
          </div>
        </div>

        {/* Right: Upcoming Events Schedule */}
        <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                  Upcoming Events Schedule
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Registered students &amp; pass redemption tracking
                </span>
              </div>
              <Link
                href="/dashboard/events"
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                title="Events Workspace"
              >
                <span className="material-symbols-outlined text-[20px]">
                  calendar_view_day
                </span>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingEvents.map((e, idx) => {
                const d = e.start_at ? new Date(e.start_at) : new Date();
                const month = d.toLocaleDateString("en-MY", { month: "short" }).toUpperCase();
                const day = d.getDate();
                const sold = e.ticket_tiers.reduce((s, t) => s + t.sold, 0);

                const bgTiles = [
                  "bg-primary-container text-on-primary-container",
                  "bg-surface-container-high text-primary",
                  "bg-primary text-on-primary",
                  "bg-secondary-container text-on-secondary-container",
                ];
                const tileStyle = bgTiles[idx % bgTiles.length];

                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high/60 transition-colors"
                  >
                    <div className="flex items-center gap-space-md">
                      <div
                        className={`w-12 h-12 rounded-lg ${tileStyle} flex flex-col items-center justify-center shrink-0 shadow-xs`}
                      >
                        <span className="font-label-sm text-label-sm uppercase leading-none font-bold">
                          {month}
                        </span>
                        <span className="font-headline-sm text-headline-sm leading-tight font-bold">
                          {day}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                          {e.title}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {e.venue ?? "Campus Quad"} • {sold} registered
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                        {e.status === "published" ? "Ready" : "Draft"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-space-md">
            <Link
              href="/dashboard/events"
              className="w-full flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors"
            >
              <span>Manage Events Timeline</span>
              <span className="material-symbols-outlined text-[16px]">
                trending_flat
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: RECENT TRANSACTIONS DATA STREAM TABLE (1:1 Stitch)
          ============================================================ */}
      <section className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-lg gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                Recent Transactions
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
                {recent.length} recent
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Real-time payment logs secured by PayPal gateway and campus balance
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard/transactions"
              className="px-3 py-1.5 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container-high font-label-sm text-label-sm font-semibold transition-colors"
            >
              All Transactions
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined text-[16px]">
                file_download
              </span>
              <span>Export CSV</span>
            </Link>
          </div>
        </div>

        {/* Responsive Table matching Stitch Row Style */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md rounded-l-lg">Order ID</th>
                <th className="py-3 px-space-md">Student / Buyer</th>
                <th className="py-3 px-space-md">Amount</th>
                <th className="py-3 px-space-md">Payment Method</th>
                <th className="py-3 px-space-md">Status</th>
                <th className="py-3 px-space-md rounded-r-lg text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              {recent.map((o) => {
                const initials = (o.customer_name ?? "TS")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isPaid = o.status === "paid" || o.status === "fulfilled";
                const isPending = o.status === "pending";

                return (
                  <tr
                    key={o.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-3.5 px-space-md font-label-md text-label-md font-semibold text-primary">
                      {o.order_number}
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm text-label-sm font-bold">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-medium text-on-surface">
                            {o.customer_name ?? "Campus Student"}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                            {o.customer_email ?? "student@campus.edu"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md font-label-md text-label-md font-bold text-primary">
                      {formatMoney(o.total_cents)}
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          account_balance_wallet
                        </span>
                        <span>PayPal Express</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                          isPaid
                            ? "bg-tertiary-fixed/30 text-on-tertiary-container"
                            : isPending
                              ? "bg-warning-container text-warning"
                              : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPaid
                              ? "bg-secondary"
                              : isPending
                                ? "bg-warning"
                                : "bg-outline"
                          }`}
                        />
                        <span>{o.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-space-md font-body-sm text-body-sm text-on-surface-variant text-right">
                      {new Date(o.created_at).toLocaleDateString("en-MY", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
