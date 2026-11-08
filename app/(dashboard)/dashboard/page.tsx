import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { StatStrip } from "@/components/ui/kpi-card";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import RevenueChart, { type RevenuePoint } from "@/components/charts/revenue-chart-lazy";
import { formatMoney } from "@/lib/money";
import { sinceIso, lastDayKeys } from "@/lib/metrics";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders, ticketTiers, products, orgs } from "@/lib/db/repo";

export const metadata = { title: "Dashboard — CampusHub 2.0" };

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

  // Time-range chips (7d/30d/90d) — real state driving the metrics window.
  const params = await searchParams;
  const raw = Number(params.window);
  const windowDays: WindowDays = (RANGES as readonly number[]).includes(raw)
    ? (raw as WindowDays)
    : 30;
  const since = sinceIso(windowDays);

  const [orgList, paidOrders, recent, revenueByDay, tickets, lowStock] =
    await Promise.all([
      orgs.list(orgIds),
      orders.listSimple(orgIds, {
        statuses: ["paid", "fulfilled", "refunded"],
      }),
      orders.listRecent(orgIds, 6),
      orders.listSimple(orgIds, {
        statuses: ["paid", "fulfilled"],
        since,
      }),
      ticketTiers.listByOrgs(orgIds),
      products.list(orgIds),
    ]);

  const revenueCents = paidOrders.reduce((s, o) => s + o.total_cents, 0);
  const refundedCents = paidOrders
    .filter((o) => o.status === "refunded")
    .reduce((s, o) => s + o.total_cents, 0);
  const ticketsSold = tickets.reduce((s, t) => s + t.sold, 0);
  const lowStockCount = lowStock.filter(
    (p) => p.status === "active" && p.stock <= p.low_stock_threshold,
  ).length;
  const lowStockItems = lowStock
    .filter((p) => p.status === "active" && p.stock <= p.low_stock_threshold)
    .slice(0, 5);

  // Revenue by day for the selected window
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

  const recentOrders = recent;
  const statusTone: Record<string, "success" | "warning" | "neutral" | "error"> = {
    paid: "success",
    fulfilled: "success",
    pending: "warning",
    cancelled: "neutral",
    refunded: "error",
  };

  const greeting = greetingFor(new Date().getHours());

  return (
    <div className="space-y-space-lg">
      {/* Welcome header + time-range chips (Stitch top banner) */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-primary">
              {greeting}, {orgList[0]?.name ?? "your org"}
            </h1>
            <span className="text-2xl" aria-hidden>
              👋
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here&apos;s your organization&apos;s performance overview.
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          {RANGES.map((days) => (
            <Link
              key={days}
              href={`/dashboard?window=${days}`}
              scroll={false}
              aria-current={windowDays === days ? "true" : undefined}
              className={cnRange(windowDays === days)}
            >
              <span className="material-symbols-outlined text-[18px] text-secondary mr-2">
                calendar_today
              </span>
              <span className="font-label-md text-label-md text-on-surface">
                Last {days} days
              </span>
            </Link>
          ))}
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-2 bg-surface-container-lowest text-primary hover:bg-surface-container-high px-space-md py-2.5 rounded-xl font-label-md text-label-md shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Quick Export
          </Link>
        </div>
      </section>

      {/* KPI grid */}
      <StatStrip
        items={[
          {
            label: "Total revenue",
            value: revenueCents,
            icon: "payments",
            format: "money",
          },
          {
            label: "Paid orders",
            value: paidOrders.length,
            icon: "receipt_long",
            tone: "primary",
          },
          {
            label: "Tickets sold",
            value: ticketsSold,
            icon: "confirmation_number",
          },
          {
            label: "Low stock products",
            value: lowStockCount,
            icon: "inventory_2",
            tone: "neutral",
          },
        ]}
      />

      {/* Revenue chart + recent orders + low stock */}
      <div className="grid gap-space-md lg:grid-cols-3">
        <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-space-md">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Revenue — last {windowDays} days
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Refunds {formatMoney(refundedCents)} · currency MYR
              </span>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Low stock list */}
        <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Low stock
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Active products at or below threshold
                </span>
              </div>
              <Link
                href="/dashboard/products"
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label="Open products"
              >
                <span className="material-symbols-outlined text-[20px]">
                  inventory
                </span>
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {lowStockItems.length === 0 ? (
                <EmptyState
                  icon="inventory_2"
                  title="Stock healthy"
                  body="No active products are at or below their low-stock threshold."
                />
              ) : (
                lowStockItems.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high/60 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {p.name}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {p.stock} left · threshold {p.low_stock_threshold}
                      </span>
                    </div>
                    <Badge tone={p.stock === 0 ? "error" : "warning"}>
                      {p.stock === 0 ? "out" : "low"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-space-md">
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Recent orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-primary font-label-lg text-label-lg font-semibold"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No orders yet"
              body="Orders will appear here after the first storefront checkout."
            />
          ) : (
            <table className="w-full text-left font-body-md text-body-md">
              <thead>
                <tr className="border-b border-outline-variant font-label-sm text-label-sm text-on-surface-variant">
                  <th className="py-2 font-semibold">Order</th>
                  <th className="py-2 font-semibold">Customer</th>
                  <th className="py-2 font-semibold">Total</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-outline-variant hover:bg-surface-low"
                  >
                    <td className="py-3 font-mono text-[12px] text-on-surface">
                      {o.order_number}
                    </td>
                    <td className="py-3 text-on-surface">
                      {o.customer_name ?? "—"}
                    </td>
                    <td className="py-3 text-on-surface">
                      {formatMoney(o.total_cents)}
                    </td>
                    <td className="py-3">
                      <Badge tone={statusTone[o.status] ?? "neutral"}>
                        {o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/** Stitch range-chip classes: selected vs idle. */
function cnRange(active: boolean): string {
  return [
    "inline-flex items-center rounded-xl px-space-md py-2.5 transition-colors shadow-sm",
    active
      ? "bg-secondary-container text-on-secondary-container font-label-md"
      : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
  ].join(" ");
}
