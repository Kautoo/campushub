"use client";

import { useMemo } from "react";
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
import {
  useCurrency,
  CURRENCY_CONFIG,
  type CurrencyCode,
} from "@/components/ui/currency-context";

export type RevenuePoint = { day: string; cents: number };

/**
 * Kinetic-gradient area chart of daily settlement revenue.
 * Sized and proportioned to fill dashboard analytics cards cleanly without dead space.
 * Reactively scales Y-axis and tooltips with the active currency context.
 */
export function RevenueChart({
  data,
  currency,
  className = "h-[280px] sm:h-[310px] w-full",
}: {
  data: RevenuePoint[];
  currency?: string;
  className?: string;
}) {
  const { currency: contextCurrency } = useCurrency();
  const activeCurrency = ((currency || contextCurrency) as CurrencyCode) ?? "MYR";
  const meta = CURRENCY_CONFIG[activeCurrency] ?? CURRENCY_CONFIG.MYR;
  const rate = meta.rateFromMyr;

  // Reactively convert revenue data according to currency exchange rate
  const convertedData = useMemo(() => {
    return data.map((pt) => ({
      day: pt.day,
      cents: Math.round(pt.cents * rate),
    }));
  }, [data, rate]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={convertedData}
          margin={{ top: 12, right: 16, bottom: 4, left: 4 }}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--st-secondary)"
                stopOpacity={0.28}
              />
              <stop
                offset="75%"
                stopColor="var(--st-secondary-container)"
                stopOpacity={0.08}
              />
              <stop
                offset="100%"
                stopColor="var(--st-surface-lowest)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--st-outline-variant)"
            opacity={0.35}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--st-outline-variant)", opacity: 0.5 }}
          />
          <YAxis
            width={64}
            tick={{ fontSize: 11, fill: "var(--st-on-surface-variant)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatMoneyCompact(v, activeCurrency)}
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
              formatMoney(Number(value), activeCurrency),
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
