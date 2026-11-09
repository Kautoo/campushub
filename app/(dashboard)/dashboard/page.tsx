import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { StatStrip } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import RevenueChart, { type RevenuePoint } from "@/components/charts/revenue-chart-lazy";
import { formatMoney } from "@/lib/money";
import { sinceIso, lastDayKeys } from "@/lib/metrics";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders, ticketTiers, products, orgs, events } from "@/lib/db/repo";

export const metadata = {
  title: "Organizer Management Dashboard — CampusHub 2.0",
};

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

  const [
    orgList,
    paidOrders,
    recent,
    revenueByDay,
    tickets,
    allProducts,
    allEvents,
  ] = await Promise.all([
    orgs.list(orgIds),
    orders.listSimple(orgIds, { statuses: ["paid", "fulfilled"] }),
    orders.listRecent(orgIds, 8),
    orders.listSimple(orgIds, { statuses: ["paid", "fulfilled"], since }),
    ticketTiers.listByOrgs(orgIds),
    products.list(orgIds),
    events.listWithTiers(orgIds),
  ]);

  const orgName = orgList[0]?.name ?? "Tech Society";
  const revenueCents = paidOrders.reduce((s, o) => s + o.total_cents, 0);
  const avgOrderCents =
    paidOrders.length > 0 ? Math.round(revenueCents / paidOrders.length) : 0;
  const ticketsSold = tickets.reduce((s, t) => s + t.sold, 0);
  const totalCapacity = allEvents.reduce((s, e) => s + (e.capacity || 0), 0);
  const capacityFillPct =
    totalCapacity > 0 ? Math.round((ticketsSold / totalCapacity) * 100) : 0;
  const lowStockProducts = allProducts.filter(
    (p) => p.status === "active" && p.stock <= p.low_stock_threshold,
  );
  const activeProductsCount = allProducts.filter(
    (p) => p.status === "active",
  ).length;

  // Revenue chart data
  const byDay = new Map<string, number>();
  for (const d of lastDayKeys(windowDays)) {
    byDay.set(d, 0);
  }
  for (const o of revenueByDay) {
    const key = new Date(o.created_at).toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + o.total_cents);
  }
  const chartData: RevenuePoint[] = [...byDay.entries()].map(([day, cents]) => ({
    day: day.slice(5),
    cents,
  }));

  const periodRevenueCents = chartData.reduce((s, pt) => s + pt.cents, 0);
  const dailyAvgCents = Math.round(periodRevenueCents / windowDays);
  const activeSettlementDays = chartData.filter((pt) => pt.cents > 0).length;
  const peakDayPoint = chartData.reduce(
    (best, pt) => (pt.cents > best.cents ? pt : best),
    { day: "—", cents: 0 },
  );
  const greeting = greetingFor(new Date().getHours());
  const topProducts = allProducts.slice(0, 4);
  const upcomingEvents = allEvents
    .filter((e) => e.status === "published" || e.status === "draft")
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* ============================================================
          SECTION 1: EXECUTIVE COMMAND HEADER & TIME HORIZON CONTROLS
          ============================================================ */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label-sm uppercase tracking-widest font-bold text-secondary">
              Executive Operations Console
            </span>
            <Badge tone="teal" icon="verified">
              PayPal Orders v2 Connected
            </Badge>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            {greeting}, {orgName}
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Real-time financial settlement, event pass velocity, and inventory health across your campus organization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Filter Selector */}
          <div
            className="inline-flex items-center bg-surface-low rounded-xl p-1 border border-outline-variant/50"
            role="group"
            aria-label="Analytics time window"
          >
            {RANGES.map((days) => (
              <Link
                key={days}
                href={`/dashboard?window=${days}`}
                scroll={false}
                className={`px-3 py-1.5 rounded-lg text-label-md font-semibold tabular-nums transition-all ${
                  windowDays === days
                    ? "bg-primary text-on-primary shadow-2xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {days}d
              </Link>
            ))}
          </div>

          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 bg-surface-lowest text-on-surface hover:bg-surface-low px-4 py-2 rounded-xl text-label-md font-semibold border border-outline-variant/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary">
              download
            </span>
            <span>Export CSV</span>
          </Link>

          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-xl text-label-md font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">
              add_circle
            </span>
            <span>Schedule Event</span>
          </Link>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: 4 EXECUTIVE KPI CARDS
          ============================================================ */}
      <StatStrip
        items={[
          {
            label: "Gross Settled Revenue",
            value: revenueCents,
            icon: "payments",
            format: "money",
            tone: "teal",
            sublabel: `Avg ${formatMoney(avgOrderCents)} per order`,
          },
          {
            label: "Paid & Fulfilled Orders",
            value: paidOrders.length,
            icon: "shopping_cart_checkout",
            tone: "primary",
            sublabel: `${recent.length} recent ledger entries`,
          },
          {
            label: "Event Passes Issued",
            value: ticketsSold,
            icon: "confirmation_number",
            tone: "success",
            sublabel: `${capacityFillPct}% of ${totalCapacity.toLocaleString()} total capacity`,
          },
          {
            label: "Low Stock Alerts",
            value: lowStockProducts.length,
            icon: "inventory_2",
            tone: "neutral",
            sublabel: `${activeProductsCount} active SKUs in catalog`,
          },
        ]}
      />

      {/* ============================================================
          SECTION 3: REVENUE VELOCITY CHART + GROUNDED AI INTELLIGENCE
          ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Sales Performance Chart — balanced spacing & 4-metric telemetry strip */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
          <div className="flex flex-col flex-1 justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/40 gap-3">
              <div>
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Financial Telemetry
                </span>
                <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
                  Daily Settlement Velocity ({windowDays}d Window)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="teal" icon="trending_up">
                  MYR Settlement
                </Badge>
              </div>
            </div>

            {/* 4-Column Chart Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
              <div className="rounded-xl bg-surface-low/80 px-3.5 py-2.5 border border-outline-variant/40">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Window Volume
                </span>
                <span className="text-headline-sm font-bold text-primary mt-0.5 block">
                  {formatMoney(periodRevenueCents)}
                </span>
              </div>
              <div className="rounded-xl bg-surface-low/80 px-3.5 py-2.5 border border-outline-variant/40">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Daily Average
                </span>
                <span className="text-headline-sm font-bold text-on-surface mt-0.5 block">
                  {formatMoney(dailyAvgCents)}
                </span>
              </div>
              <div className="rounded-xl bg-surface-low/80 px-3.5 py-2.5 border border-outline-variant/40">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Peak Day ({peakDayPoint.day})
                </span>
                <span className="text-headline-sm font-bold text-secondary mt-0.5 block">
                  {formatMoney(peakDayPoint.cents)}
                </span>
              </div>
              <div className="rounded-xl bg-surface-low/80 px-3.5 py-2.5 border border-outline-variant/40">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Active Days
                </span>
                <span className="text-headline-sm font-bold text-on-surface mt-0.5 block">
                  {activeSettlementDays} / {windowDays}d
                </span>
              </div>
            </div>

            <div className="w-full pt-1">
              <RevenueChart
                data={chartData}
                className="h-[260px] sm:h-[290px] w-full"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/35 flex flex-wrap items-center justify-between gap-2 text-body-sm text-on-surface-variant">
            <span>
              Includes verified PayPal Orders v2 captures across event passes and official club merchandise.
            </span>
            <Link
              href="/dashboard/transactions"
              className="text-label-md font-semibold text-secondary hover:underline inline-flex items-center gap-1"
            >
              <span>Inspect transaction ledger</span>
              <span className="material-symbols-outlined text-[15px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Grounded AI Intelligence Pod */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-outline-variant/50 p-6 shadow-xs bg-gradient-to-br from-surface-lowest via-surface-low/70 to-surface-container/50 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-40 h-40 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface leading-tight">
                    AI Commerce Brief
                  </h2>
                  <span className="text-[11px] text-on-surface-variant">
                    Grounded on live Postgres aggregates
                  </span>
                </div>
              </div>
              <Badge tone="teal">Active</Badge>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3.5 bg-surface-lowest rounded-xl border border-outline-variant/40 shadow-2xs">
                <span className="material-symbols-outlined text-secondary text-[19px] shrink-0 mt-0.5">
                  payments
                </span>
                <div className="text-body-sm">
                  <p className="font-semibold text-on-surface">
                    Settlement Concentration
                  </p>
                  <p className="text-on-surface-variant mt-0.5 tabular-nums">
                    Gross volume reached{" "}
                    <strong className="text-primary">
                      {formatMoney(revenueCents)}
                    </strong>{" "}
                    across {paidOrders.length} settled orders (avg{" "}
                    {formatMoney(avgOrderCents)}).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-surface-lowest rounded-xl border border-outline-variant/40 shadow-2xs">
                <span className="material-symbols-outlined text-secondary text-[19px] shrink-0 mt-0.5">
                  confirmation_number
                </span>
                <div className="text-body-sm">
                  <p className="font-semibold text-on-surface">
                    Event Pass Velocity
                  </p>
                  <p className="text-on-surface-variant mt-0.5 tabular-nums">
                    <strong className="text-primary">{ticketsSold}</strong> passes
                    issued across {allEvents.length} scheduled initiatives (
                    {capacityFillPct}% aggregate fill rate).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-surface-lowest rounded-xl border border-outline-variant/40 shadow-2xs">
                <span className="material-symbols-outlined text-warning text-[19px] shrink-0 mt-0.5">
                  inventory_2
                </span>
                <div className="text-body-sm">
                  <p className="font-semibold text-on-surface">
                    Inventory Replenishment
                  </p>
                  <p className="text-on-surface-variant mt-0.5">
                    {lowStockProducts.length > 0
                      ? `${lowStockProducts[0].name} has ${lowStockProducts[0].stock} units remaining (threshold: ${lowStockProducts[0].low_stock_threshold}).`
                      : `All ${activeProductsCount} active merchandise SKUs are above safety stock thresholds.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 relative z-10">
            <Link
              href="/dashboard/ai-insights"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold shadow-xs transition-colors"
            >
              <span>Open AI Analyst Workspace</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: TOP MERCHANDISE MATRIX & UPCOMING EVENTS SCHEDULE
          ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Performing Products */}
        <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
              <div>
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Merchandise Catalog
                </span>
                <h2 className="text-headline-sm font-bold text-on-surface mt-0.5">
                  Top Performing Products &amp; Stock Health
                </h2>
              </div>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 px-3 py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
              >
                <span>AG Grid Catalog</span>
                <span className="material-symbols-outlined text-[15px]">
                  open_in_new
                </span>
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {topProducts.map((p) => {
                const img = p.images?.[0];
                const isLow = p.stock <= p.low_stock_threshold;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/35 bg-surface-low/50 hover:bg-surface-low transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/40">
                        {img ? (
                          <div
                            role="img"
                            aria-label={p.name}
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${img}')` }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                            shopping_bag
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-body-md font-semibold text-on-surface truncate">
                            {p.name}
                          </span>
                          {p.sku ? (
                            <span className="hidden sm:inline rounded bg-surface-container px-1.5 py-0.2 font-mono text-[10.5px] text-on-surface-variant">
                              {p.sku}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 mt-1 tabular-nums">
                          <span className="text-body-sm text-on-surface-variant">
                            {p.stock} units in stock
                          </span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant" />
                          <Badge tone={isLow ? "warning" : "success"}>
                            {isLow ? "Low Stock" : "Healthy"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-right tabular-nums shrink-0">
                      <span className="text-headline-sm font-bold text-primary block">
                        {formatMoney(p.price_cents)}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Val: {formatMoney(p.stock * p.price_cents)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-outline-variant/35">
            <Link
              href="/dashboard/products"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-low hover:bg-surface-container text-primary text-label-md font-semibold transition-colors"
            >
              <span>Manage Full SKU Inventory in AG Grid</span>
              <span className="material-symbols-outlined text-[17px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Right: Upcoming Events Schedule */}
        <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
              <div>
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Bryntum Timeline Preview
                </span>
                <h2 className="text-headline-sm font-bold text-on-surface mt-0.5">
                  Upcoming Campus Events &amp; Capacity
                </h2>
              </div>
              <Link
                href="/dashboard/events"
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 px-3 py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
              >
                <span>Open Scheduler</span>
                <span className="material-symbols-outlined text-[15px]">
                  view_timeline
                </span>
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {upcomingEvents.map((e, idx) => {
                const d = e.start_at ? new Date(e.start_at) : new Date();
                const month = d
                  .toLocaleDateString("en-MY", { month: "short" })
                  .toUpperCase();
                const day = d.getDate();
                const sold = e.ticket_tiers.reduce((s, t) => s + t.sold, 0);
                const cap = e.capacity || 0;
                const pct =
                  cap > 0 ? Math.min(100, Math.round((sold / cap) * 100)) : 0;

                const bgTiles = [
                  "bg-primary text-on-primary",
                  "bg-primary-container text-white",
                  "bg-secondary-container text-on-secondary-container",
                  "bg-surface-container-high text-primary",
                ];
                const tileStyle = bgTiles[idx % bgTiles.length];

                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/35 bg-surface-low/50 hover:bg-surface-low transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl ${tileStyle} flex flex-col items-center justify-center shrink-0 shadow-2xs tabular-nums`}
                      >
                        <span className="text-[10px] uppercase leading-none font-bold tracking-wider">
                          {month}
                        </span>
                        <span className="text-headline-sm leading-tight font-bold">
                          {day}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-body-md font-semibold text-on-surface truncate">
                            {e.title}
                          </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant truncate mt-0.5">
                          {e.venue ?? "Campus Quad"} ·{" "}
                          <span className="tabular-nums font-medium text-on-surface">
                            {sold}/{cap} passes ({pct}%)
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge
                        tone={e.status === "published" ? "teal" : "warning"}
                      >
                        {e.status === "published" ? "Published" : "Draft"}
                      </Badge>
                      <div className="w-20 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className="h-full rounded-full bg-secondary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-outline-variant/35">
            <Link
              href="/dashboard/events"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-low hover:bg-surface-container text-primary text-label-md font-semibold transition-colors"
            >
              <span>Launch Bryntum Event Timeline &amp; Venue Matrix</span>
              <span className="material-symbols-outlined text-[17px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: RECENT ORDERS & SETTLEMENT STREAM
          ============================================================ */}
      <section className="flex flex-col rounded-2xl border border-outline-variant/45 bg-surface-lowest p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-outline-variant/40 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                Live Settlement Feed
              </span>
              <Badge tone="neutral">{recent.length} latest</Badge>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mt-0.5">
              Recent Storefront Orders &amp; PayPal Captures
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard/orders"
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-label-md font-semibold transition-colors"
            >
              Open Orders AG Grid
            </Link>
            <Link
              href="/dashboard/transactions"
              className="px-3.5 py-2 rounded-xl border border-outline-variant/60 bg-surface-lowest text-on-surface hover:bg-surface-low text-label-md font-semibold transition-colors"
            >
              Transactions Ledger
            </Link>
          </div>
        </div>

        <div className="w-full overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 text-on-surface-variant text-label-sm uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Student / Buyer</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/35">
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
                    className="hover:bg-surface-low/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-surface-container px-2 py-0.5 font-mono text-[12px] font-semibold text-primary">
                        {o.order_number}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-label-sm font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-body-md font-semibold text-on-surface">
                            {o.customer_name ?? "Campus Student"}
                          </span>
                          <span className="text-body-sm text-on-surface-variant">
                            {o.customer_email ?? "student@campus.edu"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-primary">
                      {formatMoney(o.total_cents)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-low border border-outline-variant/40 text-on-surface text-label-sm font-medium">
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          account_balance_wallet
                        </span>
                        <span>PayPal Orders v2</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        tone={
                          isPaid ? "success" : isPending ? "warning" : "neutral"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-body-sm text-on-surface-variant text-right tabular-nums">
                      {new Date(o.created_at).toLocaleDateString("en-MY", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
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
