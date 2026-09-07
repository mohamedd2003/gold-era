"use client";

import type { ReactNode } from "react";
import type { ApexOptions } from "apexcharts";
import { CircleAlert, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HistoryPoint, StatsPeriod } from "../types/Analytics.types";
import { STATS_PERIODS } from "../types/Analytics.types";
import {
  baseOptions,
  chartTheme,
  fillHistory,
  formatHistoryLabel,
} from "../utils/chart";
import { ApexChart } from "./ApexChart";

/**
 * Presentational chart pieces shared by the user and admin analytics views.
 * Each view owns its own data hook and passes the result down.
 */

export function ChartCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </article>
  );
}

export function PeriodSelect({
  value,
  onChange,
}: {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as StatsPeriod)}
      aria-label="Time range"
      className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {STATS_PERIODS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Bar or area chart over a selectable time period. */
export function TimeSeriesChart({
  title,
  kind,
  isDark,
  period,
  onPeriodChange,
  points,
  isPending,
  isError,
  onRetry,
}: {
  title: string;
  kind: "bar" | "area";
  isDark: boolean;
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
  points: HistoryPoint[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const history = fillHistory(points ?? [], period);
  const labels = history.map((point) => formatHistoryLabel(point.date, period));
  const theme = chartTheme(isDark);
  const hint =
    STATS_PERIODS.find((item) => item.value === period)?.hint ??
    "Uploads over time";

  return (
    <ChartCard
      title={title}
      hint={hint}
      action={<PeriodSelect value={period} onChange={onPeriodChange} />}
    >
      {isPending && !points ? (
        <div className="h-[280px] animate-pulse rounded-2xl bg-secondary/60" />
      ) : isError ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          Could not load this chart.
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-medium text-primary"
          >
            Try again
          </button>
        </div>
      ) : (
        <ApexChart
          key={`${kind}-${period}`}
          type={kind}
          height={280}
          series={
            kind === "bar"
              ? [{ name: "Files", data: history.map((point) => point.count) }]
              : [
                  { name: "Files", data: history.map((point) => point.count) },
                  {
                    name: "Storage (KB)",
                    data: history.map((point) =>
                      Math.round(point.bytes / 1024)
                    ),
                  },
                ]
          }
          options={{
            ...baseOptions(isDark),
            plotOptions: {
              bar: { borderRadius: 6, columnWidth: "55%" },
            },
            // Apex needs both explicitly set; leaving them undefined for bars
            // throws while it looks up the line defaults.
            fill:
              kind === "area"
                ? {
                    type: "gradient",
                    gradient: { opacityFrom: 0.35, opacityTo: 0.02 },
                  }
                : { type: "solid", opacity: 1 },
            stroke:
              kind === "area"
                ? { curve: "smooth", width: 2 }
                : { show: true, width: 0, curve: "smooth" },
            xaxis: {
              categories: labels,
              labels: { rotate: -45, style: { colors: theme.muted } },
              axisBorder: { show: false },
              axisTicks: { show: false },
            },
            yaxis:
              kind === "bar"
                ? {
                    min: 0,
                    forceNiceScale: true,
                    labels: { style: { colors: theme.muted } },
                  }
                : [
                    {
                      min: 0,
                      forceNiceScale: true,
                      labels: { style: { colors: theme.muted } },
                      title: { text: "Files", style: { color: theme.muted } },
                    },
                    {
                      opposite: true,
                      min: 0,
                      forceNiceScale: true,
                      labels: { style: { colors: theme.muted } },
                      title: { text: "KB", style: { color: theme.muted } },
                    },
                  ],
          }}
        />
      )}
    </ChartCard>
  );
}

export function donutOptions(
  isDark: boolean,
  labels: string[],
  valueFormatter?: (value: string) => string
): ApexOptions {
  const theme = chartTheme(isDark);
  return {
    ...baseOptions(isDark),
    labels,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { color: theme.muted },
            value: {
              color: theme.text,
              formatter: valueFormatter,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      labels: { colors: theme.muted },
    },
  };
}

export function Kpi({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function EmptyChart({
  message = "Upload files to see this chart.",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ChartsErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <CircleAlert className="size-6 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
      >
        <RefreshCw className="size-3.5" />
        Try again
      </button>
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((card) => (
        <div
          key={card}
          className="h-[360px] animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}
