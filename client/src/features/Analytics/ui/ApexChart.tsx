"use client";

import dynamic from "next/dynamic";

/** ApexCharts touches `window`, so it must not render on the server. */
export const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] animate-pulse rounded-2xl bg-secondary/60" />
  ),
});
