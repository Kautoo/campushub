"use client";

import dynamic from "next/dynamic";
import type { RevenuePoint } from "./revenue-chart";

export type { RevenuePoint } from "./revenue-chart";

// recharts is heavy (~100kB+); load it lazily, browser-only, once the
// dashboard shell paints. ssr:false requires a client wrapper.
const RevenueChart = dynamic(() => import("./revenue-chart").then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-lg bg-surface-container" />,
});

export default RevenueChart;
