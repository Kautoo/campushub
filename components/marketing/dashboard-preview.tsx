"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { StatStrip } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/magicui";
import { NumberTicker } from "@/components/magicui/number-ticker";

/**
 * Pixel-faithful replica of the real dashboard overview (app/(dashboard)/
 * dashboard/page.tsx): same StatStrip, same revenue chart, same lifetime
 * tile, same orders table — populated with the exact Tech Society seed
 * aggregates so the landing page shows the true product, not a lookalike.
 */
type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  total_cents: number;
  status: string;
  created_at: string;
};

const REVENUE_CENTS = 292447; // seed: paid+fulfilled+refunded orders total
const PAID_ORDER_COUNT = 34;
const TICKETS_SOLD = 326;
const LOW_STOCK = 1;

const RECENT_ORDERS: OrderRow[] = [
  { id: "1", order_number: "CH-1040", customer_name: "Arif Zulkifli", total_cents: 15900, status: "paid", created_at: "" },
  { id: "2", order_number: "CH-1039", customer_name: "Josh Tan", total_cents: 7900, status: "pending", created_at: "" },
  { id: "3", order_number: "CH-1038", customer_name: "Mei Ling Chan", total_cents: 35800, status: "fulfilled", created_at: "" },
  { id: "4", order_number: "CH-1037", customer_name: "Hafiz Rahman", total_cents: 9000, status: "paid", created_at: "" },
  { id: "5", order_number: "CH-1036", customer_name: "Nadia Salleh", total_cents: 12000, status: "paid", created_at: "" },
  { id: "6", order_number: "CH-1035", customer_name: "Sofia Lopez", total_cents: 3300, status: "refunded", created_at: "" },
];

// Real 30-day revenue shape from the seed (day offsets and totals in cents)
const CHART: { day: string; cents: number }[] = (() => {
  const days: { day: string; cents: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    days.push({ day: d.toISOString().slice(5, 10), cents: 0 });
  }
  // Seed orders spread across the last 30 days (from 0002_demo.sql spread)
  const spread: Record<number, number> = {
    29: 15900, 27: 3300, 26: 7900, 24: 12000, 22: 9900, 21: 3300, 19: 15900,
    18: 3300, 16: 9900, 15: 15900, 13: 7900, 12: 3300, 10: 12000, 9: 9900,
    7: 3300, 6: 15900, 4: 7900, 3: 3300, 1: 12000, 0: 15900,
  };
  for (const [offset, cents] of Object.entries(spread)) {
    const idx = 29 - Number(offset);
    if (days[idx]) days[idx].cents = cents;
  }
  return days;
})();

export function DashboardPreview() {
  const statusTone: Record<string, "success" | "warning" | "neutral" | "error"> = {
    paid: "success",
    fulfilled: "success",
    pending: "warning",
    cancelled: "neutral",
    refunded: "error",
  };

  return (
    <div className="space-y-6">
      {/* Same KPI strip component the dashboard uses */}
      <StatStrip
        items={[
          { label: "Total revenue", value: REVENUE_CENTS, icon: "payments", format: "money" },
          { label: "Paid orders", value: PAID_ORDER_COUNT, icon: "receipt_long" },
          { label: "Tickets sold", value: TICKETS_SOLD, icon: "confirmation_number" },
          { label: "Low stock products", value: LOW_STOCK, icon: "inventory_2", tone: "neutral" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-lowest p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-headline-sm text-ink">Revenue — last 30 days</h3>
            <Badge tone="teal">refunds RM 330.00</Badge>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="previewFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--st-gradient-a)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--st-gradient-a)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--st-outline-variant)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }} tickLine={false} axisLine={{ stroke: "var(--st-outline-variant)" }} interval={4} />
                <YAxis width={70} tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatMoneyCompact(v)} />
                <Tooltip
                  contentStyle={{
                    background: "var(--st-surface-lowest)",
                    border: "1px solid var(--st-outline-variant)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--st-on-surface)",
                  }}
                  formatter={(value) => formatMoneyCompact(Number(value))}
                />
                <Area type="monotone" dataKey="cents" stroke="var(--st-gradient-a)" strokeWidth={2} fill="url(#previewFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lifetime volume tile — same as dashboard */}
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-white dark:bg-surface-container dark:text-ink">
          <BorderBeam size={70} duration={9} />
          <div className="relative">
            <p className="text-label-lg opacity-80">Lifetime gross volume</p>
            <p className="text-display-lg mt-2 tracking-tight dark:text-primary">
              <NumberTicker value={REVENUE_CENTS / 100} decimalPlaces={2} />
            </p>
            <p className="text-body-sm mt-1 opacity-70">
              {formatMoney(REVENUE_CENTS)} across {PAID_ORDER_COUNT} paid orders · currency MYR
            </p>
          </div>
        </div>
      </div>

      {/* Same orders table as the dashboard's recent-orders block */}
      <div className="rounded-xl border border-outline-variant bg-surface-lowest">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-headline-sm text-ink">Recent orders</h3>
          <span className="text-primary text-label-lg font-semibold">View all →</span>
        </div>
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
            {RECENT_ORDERS.map((o) => (
              <tr key={o.id} className="border-t border-outline-variant hover:bg-surface-low">
                <td className="px-5 py-3 font-mono text-[12px] text-ink">{o.order_number}</td>
                <td className="px-5 py-3 text-ink">{o.customer_name}</td>
                <td className="px-5 py-3 text-ink">{formatMoney(o.total_cents)}</td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone[o.status] ?? "neutral"}>{o.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
