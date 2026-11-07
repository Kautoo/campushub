import { getSupabaseServerSafe } from "@/lib/supabase/safe";


/** Aggregates for the grounded-AI metrics pack (see /api/insights/pack). */
export type MetricsPack = {
  org: { name: string; currency: string };
  window: { since: string; until: string };
  revenue: {
    total_cents: number;
    refunded_cents: number;
    by_day_cents: { day: string; cents: number }[];
  };
  orders: {
    total: number;
    by_status: Record<string, number>;
    top_products: { name: string; units: number; revenue_cents: number }[];
  };
  events: {
    total: number;
    published: number;
    sell_through: { title: string; sold: number; quantity: number }[];
  };
  inventory: {
    low_stock: { name: string; stock: number; threshold: number }[];
    out_of_stock: number;
  };
};

export async function buildMetricsPack(
  orgId: string,
  windowDays: number,
): Promise<MetricsPack | null> {
  const supabase = await getSupabaseServerSafe();
  if (!supabase) return null;

  const since = new Date(Date.now() - windowDays * 86400_000);
  const sinceIso = since.toISOString();

  const [orgRes, paidOrdersRes, byDayRes, itemsRes, eventsRes, tiersRes, lowStockRes, oosRes] =
    await Promise.all([
      supabase.from("organizations").select("name, currency").eq("id", orgId).single(),
      supabase.from("orders").select("total_cents, status"),
      supabase
        .from("orders")
        .select("total_cents, created_at")
        .in("status", ["paid", "fulfilled"])
        .gte("created_at", sinceIso),
      supabase
        .from("order_items")
        .select("name_snapshot, qty, unit_price_cents")
        .eq("kind", "product"),
      supabase.from("events").select("id, title, status"),
      supabase.from("ticket_tiers").select("event_id, name, quantity, sold"),
      supabase
        .from("products")
        .select("name, stock, low_stock_threshold")
        .eq("status", "active")
        .filter("stock", "lte", "low_stock_threshold")
        .gt("stock", 0),
      supabase.from("products").select("id", { count: "exact", head: true })
        .eq("status", "active").eq("stock", 0),
    ]);

  const org = orgRes.data;
  if (!org) return null;

  const orders = paidOrdersRes.data ?? [];
  const statusCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  const byDay = new Map<string, number>();
  for (let i = windowDays - 1; i >= 0; i--) {
    byDay.set(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10), 0);
  }
  for (const o of byDayRes.data ?? []) {
    const d = o.created_at.slice(0, 10);
    if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + o.total_cents);
  }

  // Top products from order items (all time)
  const perProduct = new Map<string, { units: number; revenue_cents: number }>();
  for (const it of itemsRes.data ?? []) {
    const cur = perProduct.get(it.name_snapshot) ?? { units: 0, revenue_cents: 0 };
    cur.units += it.qty;
    cur.revenue_cents += it.qty * it.unit_price_cents;
    perProduct.set(it.name_snapshot, cur);
  }
  const top_products = [...perProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue_cents - a.revenue_cents)
    .slice(0, 8);

  const events = eventsRes.data ?? [];
  const tiers = tiersRes.data ?? [];
  const sell_through = events
    .filter((e) => e.status === "published" || e.status === "completed")
    .map((e) => {
      const eventTiers = tiers.filter((t) => t.event_id === e.id);
      return {
        title: e.title,
        sold: eventTiers.reduce((s, t) => s + t.sold, 0),
        quantity: eventTiers.reduce((s, t) => s + t.quantity, 0),
      };
    });

  const refunded = orders
    .filter((o) => o.status === "refunded")
    .reduce((s, o) => s + o.total_cents, 0);
  const paidish = orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");

  return {
    org: { name: org.name, currency: org.currency },
    window: { since: sinceIso, until: new Date().toISOString() },
    revenue: {
      total_cents: paidish.reduce((s, o) => s + o.total_cents, 0),
      refunded_cents: refunded,
      by_day_cents: [...byDay.entries()].map(([day, cents]) => ({ day, cents })),
    },
    orders: {
      total: orders.length,
      by_status: statusCounts,
      top_products,
    },
    events: {
      total: events.length,
      published: events.filter((e) => e.status === "published").length,
      sell_through,
    },
    inventory: {
      low_stock: (lowStockRes.data ?? []).map((p) => ({
        name: p.name,
        stock: p.stock,
        threshold: p.low_stock_threshold,
      })),
      out_of_stock: oosRes.count ?? 0,
    },
  };
}
