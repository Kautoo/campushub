import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/layout/setup-notice";
import { StatStrip } from "@/components/ui/kpi-card";
import { SectionHeader, EmptyState } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import RevenueChart, { type RevenuePoint } from "@/components/charts/revenue-chart-lazy";
import { formatMoney } from "@/lib/money";
import { sinceIso, lastDayKeys } from "@/lib/metrics";
import { NumberTicker } from "@/components/magicui";
import { getDbSafe } from "@/lib/db/safe";
import { getSessionContext } from "@/lib/auth/session";
import { orders, ticketTiers, products } from "@/lib/db/repo";

export const metadata = { title: "Dashboard — CampusHub 2.0" };

export default async function DashboardOverview() {
  const db = getDbSafe();
  if (!db) return <SetupNotice what="the dashboard" />;
  const session = await getSessionContext();
  if (!session) redirect("/login");
  const orgIds = session.orgIds;

  // Async server component: runs once per request, never re-renders. The
  // helpers hide Date.now() so the purity rule can't trace it here.
  // eslint-disable-next-line react-hooks/purity -- one-shot server render, fresh window per request is the point
  const since = sinceIso(30);

  const [paidOrders, recent, revenueByDay, tickets, lowStock] =
    await Promise.all([
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

  // Revenue by day (last 30d)
  const byDay = new Map<string, number>();
  // eslint-disable-next-line react-hooks/purity -- one-shot server render, fresh window per request is the point
  for (const d of lastDayKeys(30)) {
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

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="space_dashboard"
        title="Overview"
        subtitle="Commerce and events at a glance"
        actions={
          <Link
            href="/dashboard/ai-insights"
            className="text-primary text-label-lg font-semibold"
          >
            Ask your data →
          </Link>
        }
      />

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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-lowest p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-headline-sm text-ink">
              Revenue — last 30 days
            </h3>
            <Badge tone="teal">
              refunds {formatMoney(refundedCents)}
            </Badge>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-white dark:bg-surface-container dark:text-ink">
          <div className="relative">
            <p className="text-label-lg opacity-80">Lifetime gross volume</p>
            <p className="text-display-lg mt-2 tracking-tight dark:text-primary">
              <NumberTicker value={revenueCents / 100} decimalPlaces={2} />
            </p>
            <p className="text-body-sm mt-1 opacity-70">
              {formatMoney(revenueCents)} across {paidOrders.length} paid
              orders · currency MYR
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-lowest">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-headline-sm text-ink">Recent orders</h3>
          <Link
            href="/dashboard/orders"
            className="text-primary text-label-lg font-semibold"
          >
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No orders yet"
            body="Orders will appear here after the first storefront checkout."
            className="m-4"
          />
        ) : (
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="border-t border-outline-variant text-label-sm text-muted">
                <th className="px-5 py-2 font-semibold">Order</th>
                <th className="px-5 py-2 font-semibold">Customer</th>
                <th className="px-5 py-2 font-semibold">Total</th>
                <th className="px-5 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-outline-variant hover:bg-surface-low"
                >
                  <td className="px-5 py-3 font-mono text-[12px] text-ink">
                    {o.order_number}
                  </td>
                  <td className="px-5 py-3 text-ink">
                    {o.customer_name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-ink">
                    {formatMoney(o.total_cents)}
                  </td>
                  <td className="px-5 py-3">
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
  );
}
