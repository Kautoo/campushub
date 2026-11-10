import { hasDatabaseEnv } from "@/lib/db";
import { orgs, orders, orderItems, events, ticketTiers, products } from "@/lib/db/repo";

/**
 * Shared "recent window" helpers. Called from async server code (not during
 * React render) so the impure Date.now() stays out of component bodies.
 */

/** ISO timestamp `days` before now. */
export function sinceIso(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

/** Day keys ("MM-DD") for the last `days` days, oldest first. */
export function lastDayKeys(days: number): string[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(new Date(Date.now() - i * 86400_000).toISOString().slice(5, 10));
  }
  return keys;
}


/** Aggregates for the grounded-AI metrics pack (see /api/insights/pack). */
export type MetricsPack = {
  org: { name: string; currency: string };
  window: { since: string; until: string };
  revenue: {
    total_cents: number;
    refunded_cents: number;
    by_day_cents: { day: string; cents: number }[];
  };
  orders: { total: number; by_status: Record<string, number>; top_products: { name: string; units: number; revenue_cents: number }[] };
  events: {
    total: number;
    published: number;
    sell_through: { title: string; sold: number; quantity: number }[];
  };
  inventory: {
    total_active: number;
    low_stock: { name: string; stock: number; threshold: number }[];
    out_of_stock: number;
  };
};

export async function buildMetricsPack(
  orgId: string,
  windowDays: number,
): Promise<MetricsPack | null> {
  if (!hasDatabaseEnv()) return null;

  const since = new Date(Date.now() - windowDays * 86400_000);
  const sinceIso = since.toISOString();

  const [org, paidOrders, byDayRows, itemRows, eventRows, tierRows, productRows] =
    await Promise.all([
      orgs.getById(orgId),
      orders.listSimple([orgId]),
      orders.listSimple([orgId], { statuses: ["paid", "fulfilled"], since: sinceIso }),
      orderItems.listByOrgAllTime([orgId]),
      events.listByOrgs([orgId]),
      ticketTiers.listByOrgs([orgId]),
      products.list([orgId]),
    ]);

  if (!org) return null;

  const orders_ = paidOrders;
  const statusCounts: Record<string, number> = {};
  for (const o of orders_) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  const byDay = new Map<string, number>();
  for (let i = windowDays - 1; i >= 0; i--) {
    byDay.set(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10), 0);
  }
  for (const o of byDayRows) {
    const d = o.created_at.slice(0, 10);
    if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + o.total_cents);
  }

  // Top products from order items (all time)
  const perProduct = new Map<string, { units: number; revenue_cents: number }>();
  for (const it of itemRows) {
    const cur = perProduct.get(it.name_snapshot) ?? { units: 0, revenue_cents: 0 };
    cur.units += it.qty;
    cur.revenue_cents += it.qty * it.unit_price_cents;
    perProduct.set(it.name_snapshot, cur);
  }
  const top_products = [...perProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue_cents - a.revenue_cents)
    .slice(0, 8);

  const events_ = eventRows;
  const tiers = tierRows;
  const sell_through = events_
    .filter((e) => e.status === "published" || e.status === "completed")
    .map((e) => {
      const eventTiers = tiers.filter((t) => t.event_id === e.id);
      return {
        title: e.title,
        sold: eventTiers.reduce((s, t) => s + t.sold, 0),
        quantity: eventTiers.reduce((s, t) => s + t.quantity, 0),
      };
    });

  const refunded = orders_
    .filter((o) => o.status === "refunded")
    .reduce((s, o) => s + o.total_cents, 0);
  const paidish = orders_.filter((o) => o.status !== "pending" && o.status !== "cancelled");

  const active = productRows.filter((p) => p.status === "active");

  return {
    org: { name: org.name, currency: org.currency },
    window: { since: sinceIso, until: new Date().toISOString() },
    revenue: {
      total_cents: paidish.reduce((s, o) => s + o.total_cents, 0),
      refunded_cents: refunded,
      by_day_cents: [...byDay.entries()].map(([day, cents]) => ({ day, cents })),
    },
    orders: {
      total: orders_.length,
      by_status: statusCounts,
      top_products,
    },
    events: {
      total: events_.length,
      published: events_.filter((e) => e.status === "published").length,
      sell_through,
    },
    inventory: {
      total_active: active.length,
      low_stock: active
        .filter((p) => p.stock <= p.low_stock_threshold && p.stock > 0)
        .map((p) => ({
          name: p.name,
          stock: p.stock,
          threshold: p.low_stock_threshold,
        })),
      out_of_stock: active.filter((p) => p.stock === 0).length,
    },
  };
}
