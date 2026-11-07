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
import { formatMoneyCompact } from "@/lib/money";

export type RevenuePoint = { day: string; cents: number };

/** Kinetic-gradient area chart of revenue by day. */
export function RevenueChart({
  data,
  currency = "MYR",
}: {
  data: RevenuePoint[];
  currency?: string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--st-gradient-a)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--st-gradient-a)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--st-outline-variant)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--st-outline-variant)" }}
          />
          <YAxis
            width={70}
            tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatMoneyCompact(v, currency)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--st-surface-lowest)",
              border: "1px solid var(--st-outline-variant)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--st-on-surface)",
            }}
            formatter={(value) => formatMoneyCompact(Number(value), currency)}
          />
          <Area
            type="monotone"
            dataKey="cents"
            stroke="var(--st-gradient-a)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
