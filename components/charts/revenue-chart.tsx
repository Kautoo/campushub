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

export type RevenuePoint = { day: string; cents: number };

/**
 * Kinetic-gradient area chart of daily settlement revenue.
 * Sized and proportioned to fill dashboard analytics cards cleanly without dead space.
 */
export function RevenueChart({
  data,
  currency = "MYR",
  className = "h-[280px] sm:h-[310px] w-full",
}: {
  data: RevenuePoint[];
  currency?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 16, bottom: 4, left: 4 }}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--st-gradient-a)"
                stopOpacity={0.42}
              />
              <stop
                offset="65%"
                stopColor="var(--st-gradient-a)"
                stopOpacity={0.12}
              />
              <stop
                offset="100%"
                stopColor="var(--st-gradient-a)"
                stopOpacity={0.01}
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
            tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--st-outline-variant)", strokeOpacity: 0.6 }}
            tickMargin={8}
            minTickGap={20}
          />
          <YAxis
            width={62}
            tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatMoneyCompact(v, currency)}
          />
          <Tooltip
            cursor={{
              stroke: "var(--st-secondary)",
              strokeWidth: 1.5,
              strokeDasharray: "4 4",
            }}
            contentStyle={{
              background: "var(--st-surface-lowest)",
              border: "1px solid var(--st-outline-variant)",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--st-on-surface)",
              boxShadow: "0 10px 25px -5px rgba(0, 22, 46, 0.16)",
              padding: "8px 12px",
            }}
            labelStyle={{
              color: "var(--st-on-surface-variant)",
              fontSize: 11,
              marginBottom: 4,
            }}
            formatter={(value) => [
              formatMoney(Number(value), currency),
              "Settled Revenue",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cents"
            stroke="var(--st-secondary)"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
            activeDot={{
              r: 5,
              strokeWidth: 2,
              stroke: "var(--st-surface-lowest)",
              fill: "var(--st-secondary)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
