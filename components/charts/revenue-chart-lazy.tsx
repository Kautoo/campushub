"use client";

import dynamic from "next/dynamic";

export type { RevenuePoint } from "./revenue-chart";

const RevenueChart = dynamic(
  () => import("./revenue-chart").then((m) => m.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] sm:h-[310px] w-full animate-pulse rounded-xl bg-surface-container" />
    ),
  },
);

export default RevenueChart;
