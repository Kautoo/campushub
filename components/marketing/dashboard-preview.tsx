"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { StatStrip } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";

/**
 * 1:1 Live Replica of the actual redesigned DashboardOverview page
 * (app/(dashboard)/dashboard/page.tsx), populated with the Tech Society seed data.
 */
const REVENUE_CENTS = 292447;
const PAID_ORDER_COUNT = 34;
const TICKETS_SOLD = 293;
const TOTAL_CAPACITY = 1980;
const LOW_STOCK = 1;

const RECENT_ORDERS = [
  {
    id: "1",
    order_number: "CH-1040",
    customer_name: "Aminah Hassan",
    customer_email: "aminah.h@campus.edu.my",
    total_cents: 12295,
    status: "paid",
    created_at: "Nov 8, 2026",
  },
  {
    id: "2",
    order_number: "CH-1039",
    customer_name: "Wei Jian Lim",
    customer_email: "wei.jian@campus.edu.my",
    total_cents: 9311,
    status: "fulfilled",
    created_at: "Nov 7, 2026",
  },
  {
    id: "3",
    order_number: "CH-1038",
    customer_name: "Priya Nair",
    customer_email: "priya.n@campus.edu.my",
    total_cents: 4681,
    status: "paid",
    created_at: "Nov 6, 2026",
  },
  {
    id: "4",
    order_number: "CH-1037",
    customer_name: "Danish Karim",
    customer_email: "danish.k@campus.edu.my",
    total_cents: 16411,
    status: "paid",
    created_at: "Nov 5, 2026",
  },
];

const TOP_PRODUCTS = [
  {
    name: "CampusHub Tee — Navy",
    sku: "TS-TEE-NVY",
    stock: 120,
    price_cents: 4500,
    low: false,
  },
  {
    name: "Hoodie — Midnight",
    sku: "TS-HOD-MDN",
    stock: 45,
    price_cents: 11900,
    low: false,
  },
  {
    name: "Mech Keycap Set",
    sku: "TS-KC-PBT",
    stock: 8,
    price_cents: 15900,
    low: true,
  },
];

const UPCOMING_EVENTS = [
  {
    month: "NOV",
    day: 21,
    title: "Innovation Week 2026",
    venue: "Main Hall, Block C",
    sold: 220,
    cap: 500,
    status: "Published",
  },
  {
    month: "DEC",
    day: 4,
    title: "AI & ML Bootcamp",
    venue: "Lab 2, CS Building",
    sold: 35,
    cap: 80,
    status: "Published",
  },
  {
    month: "DEC",
    day: 19,
    title: "Hack the Campus 48h",
    venue: "Innovation Lab",
    sold: 38,
    cap: 200,
    status: "Published",
  },
];

const CHART: { day: string; cents: number }[] = (() => {
  const sparse: Record<number, number> = {
    2: 9200,
    5: 13800,
    7: 4600,
    10: 24300,
    12: 7100,
    14: 18600,
    16: 11900,
    19: 32400,
    21: 9800,
    23: 27600,
    25: 14500,
    27: 41200,
    28: 22300,
    29: 55147,
  };
  const out: { day: string; cents: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const m = i < 15 ? "10" : "11";
    const d = String((i % 15) + 1).padStart(2, "0");
    out.push({ day: `${m}-${d}`, cents: sparse[i] ?? 0 });
  }
  return out;
})();

export function DashboardPreview() {
  return (
    <div className="space-y-5">
      {/* SECTION 1: EXECUTIVE COMMAND HEADER (1:1 with DashboardOverview) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label-sm uppercase tracking-widest font-bold text-secondary">
              Executive Operations Console
            </span>
            <Badge tone="teal" icon="verified">
              PayPal Orders v2 Connected
            </Badge>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface tracking-tight">
            Good morning, Tech Society
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            Real-time financial settlement, event pass velocity, and inventory
            health across your campus organization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center bg-surface-low rounded-xl p-1 border border-outline-variant/50 text-label-sm font-semibold tabular-nums">
            <span className="px-2.5 py-1 text-on-surface-variant">7d</span>
            <span className="px-2.5 py-1 rounded-lg bg-primary text-on-primary shadow-2xs">
              30d
            </span>
            <span className="px-2.5 py-1 text-on-surface-variant">90d</span>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-surface-lowest text-on-surface px-3.5 py-2 rounded-xl text-label-sm font-semibold border border-outline-variant/60">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              download
            </span>
            Export CSV
          </span>
          <span className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3.5 py-2 rounded-xl text-label-sm font-semibold shadow-2xs">
            <span className="material-symbols-outlined text-[16px]">
              add_circle
            </span>
            Schedule Event
          </span>
        </div>
      </div>

      {/* SECTION 2: 4 EXECUTIVE KPI CARDS */}
      <StatStrip
        items={[
          {
            label: "Gross Settled Revenue",
            value: REVENUE_CENTS,
            icon: "payments",
            format: "money",
            tone: "teal",
            sublabel: "Avg RM 86.01 per order",
          },
          {
            label: "Paid & Fulfilled Orders",
            value: PAID_ORDER_COUNT,
            icon: "shopping_cart_checkout",
            tone: "primary",
            sublabel: "Tracked in AG Grid Community",
          },
          {
            label: "Event Passes Issued",
            value: TICKETS_SOLD,
            icon: "confirmation_number",
            tone: "success",
            sublabel: `15% of ${TOTAL_CAPACITY.toLocaleString()} total capacity`,
          },
          {
            label: "Low Stock Alerts",
            value: LOW_STOCK,
            icon: "inventory_2",
            tone: "neutral",
            sublabel: "12 active SKUs in catalog",
          },
        ]}
      />

      {/* SECTION 3: REVENUE VELOCITY CHART (8 COLS) + AI COMMERCE BRIEF (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 8 Cols: Daily Settlement Velocity */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant/40 gap-2">
              <div>
                <span className="text-label-sm uppercase tracking-wider font-bold text-secondary">
                  Financial Telemetry
                </span>
                <h4 className="text-headline-sm font-bold text-on-surface mt-0.5">
                  Daily Settlement Velocity (30d Window)
                </h4>
              </div>
              <Badge tone="teal" icon="trending_up">
                MYR Settlement
              </Badge>
            </div>

            {/* 4-Column Chart Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
              <div className="rounded-xl bg-surface-low/80 px-3 py-2 border border-outline-variant/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Window Volume
                </span>
                <span className="text-body-md font-bold text-primary mt-0.5 block">
                  {formatMoney(REVENUE_CENTS)}
                </span>
              </div>
              <div className="rounded-xl bg-surface-low/80 px-3 py-2 border border-outline-variant/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Daily Average
                </span>
                <span className="text-body-md font-bold text-on-surface mt-0.5 block">
                  RM 97.48
                </span>
              </div>
              <div className="rounded-xl bg-surface-low/80 px-3 py-2 border border-outline-variant/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Peak Day (11-15)
                </span>
                <span className="text-body-md font-bold text-secondary mt-0.5 block">
                  RM 551.47
                </span>
              </div>
              <div className="rounded-xl bg-surface-low/80 px-3 py-2 border border-outline-variant/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                  Active Days
                </span>
                <span className="text-body-md font-bold text-on-surface mt-0.5 block">
                  14 / 30d
                </span>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={CHART}
                  margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="previewFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--st-gradient-a)"
                        stopOpacity={0.42}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--st-gradient-a)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--st-outline-variant)"
                    strokeOpacity={0.55}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: "var(--st-on-surface-variant)",
                    }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--st-outline-variant)" }}
                    interval={4}
                  />
                  <YAxis
                    width={60}
                    tick={{
                      fontSize: 11,
                      fill: "var(--st-on-surface-variant)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatMoneyCompact(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--st-surface-lowest)",
                      border: "1px solid var(--st-outline-variant)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "var(--st-on-surface)",
                    }}
                    formatter={(value) => formatMoney(Number(value))}
                  />
                  <Area
                    type="monotone"
                    dataKey="cents"
                    stroke="var(--st-secondary)"
                    strokeWidth={2.5}
                    fill="url(#previewFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-outline-variant/35 flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              Includes verified PayPal Orders v2 captures across passes and club merchandise.
            </span>
            <span className="font-semibold text-secondary">
              Transactions ledger →
            </span>
          </div>
        </div>

        {/* Right 4 Cols: AI Commerce Brief (1:1 with DashboardOverview) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-outline-variant/50 p-5 shadow-xs bg-gradient-to-br from-surface-lowest via-surface-low/70 to-surface-container/50">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-outline-variant/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h4 className="text-headline-sm font-bold text-on-surface leading-tight">
                    AI Commerce Brief
                  </h4>
                  <span className="text-[11px] text-on-surface-variant">
                    Grounded on live Postgres aggregates
                  </span>
                </div>
              </div>
              <Badge tone="teal">Active</Badge>
            </div>

            <div className="mt-3.5 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5 p-3 bg-surface-lowest rounded-xl border border-outline-variant/40">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  payments
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-on-surface">
                    Settlement Concentration
                  </p>
                  <p className="text-on-surface-variant mt-0.5 tabular-nums">
                    Gross volume reached{" "}
                    <strong className="text-primary">
                      {formatMoney(REVENUE_CENTS)}
                    </strong>{" "}
                    across {PAID_ORDER_COUNT} settled orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-surface-lowest rounded-xl border border-outline-variant/40">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  confirmation_number
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-on-surface">
                    Event Pass Velocity
                  </p>
                  <p className="text-on-surface-variant mt-0.5 tabular-nums">
                    <strong className="text-primary">{TICKETS_SOLD}</strong>{" "}
                    passes issued across 6 scheduled initiatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-surface-lowest rounded-xl border border-outline-variant/40">
                <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">
                  inventory_2
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-on-surface">
                    Inventory Replenishment
                  </p>
                  <p className="text-on-surface-variant mt-0.5">
                    Mech Keycap Set has 8 units remaining (threshold: 8).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <span className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-on-primary text-label-sm font-semibold">
              <span>Open AI Analyst Workspace</span>
              <span className="material-symbols-outlined text-[15px]">
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: TOP MERCHANDISE & UPCOMING EVENTS (1:1 with DashboardOverview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
            <div>
              <span className="text-[10.5px] uppercase tracking-wider font-bold text-secondary block">
                Merchandise Catalog
              </span>
              <h4 className="text-headline-sm font-bold text-on-surface">
                Top Performing Products &amp; Stock Health
              </h4>
            </div>
            <Badge tone="primary">AG Grid</Badge>
          </div>
          <div className="space-y-2">
            {TOP_PRODUCTS.map((p) => (
              <div
                key={p.sku}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-outline-variant/35 bg-surface-low/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-semibold text-on-surface truncate">
                      {p.name}
                    </span>
                    <span className="rounded bg-surface-container px-1.5 py-0.2 font-mono text-[10px] text-on-surface-variant">
                      {p.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 tabular-nums text-xs text-on-surface-variant">
                    <span>{p.stock} units in stock</span>
                    <span>•</span>
                    <Badge tone={p.low ? "warning" : "success"}>
                      {p.low ? "Low Stock" : "Healthy"}
                    </Badge>
                  </div>
                </div>
                <span className="text-body-md font-bold text-primary tabular-nums shrink-0">
                  {formatMoney(p.price_cents)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
            <div>
              <span className="text-[10.5px] uppercase tracking-wider font-bold text-secondary block">
                Bryntum Timeline Preview
              </span>
              <h4 className="text-headline-sm font-bold text-on-surface">
                Upcoming Campus Events &amp; Capacity
              </h4>
            </div>
            <Badge tone="teal">Bryntum 8.0</Badge>
          </div>
          <div className="space-y-2">
            {UPCOMING_EVENTS.map((e) => {
              const pct = Math.round((e.sold / e.cap) * 100);
              return (
                <div
                  key={e.title}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-outline-variant/35 bg-surface-low/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center shrink-0 tabular-nums">
                      <span className="text-[9px] font-bold uppercase leading-none">
                        {e.month}
                      </span>
                      <span className="text-body-md font-bold leading-tight">
                        {e.day}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-on-surface truncate">
                        {e.title}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate tabular-nums">
                        {e.venue} · {e.sold}/{e.cap} passes ({pct}%)
                      </p>
                    </div>
                  </div>
                  <Badge tone="teal">{e.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT ORDERS STREAM */}
      <div className="rounded-2xl border border-outline-variant/45 bg-surface-lowest p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-2">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider font-bold text-secondary block">
              Live Settlement Feed
            </span>
            <h4 className="text-headline-sm font-bold text-on-surface">
              Recent Storefront Orders &amp; PayPal Captures
            </h4>
          </div>
          <Badge tone="neutral">{RECENT_ORDERS.length} latest</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b border-outline-variant/40 text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Student / Buyer</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/35">
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td className="py-2.5 px-3 font-mono text-xs font-semibold text-primary">
                    {o.order_number}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-on-surface">
                      {o.customer_name}
                    </span>
                    <span className="text-xs text-on-surface-variant ml-2 hidden sm:inline">
                      {o.customer_email}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary tabular-nums">
                    {formatMoney(o.total_cents)}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge tone="success">{o.status}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right text-xs text-on-surface-variant tabular-nums">
                    {o.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
