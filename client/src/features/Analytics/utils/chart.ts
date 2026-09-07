import type { ApexOptions } from "apexcharts";
import type {
  FileTypeStat,
  HistoryPoint,
  StatsPeriod,
} from "../types/Analytics.types";

export const CHART_COLORS = [
  "#4f7cff",
  "#7c9cff",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#14b8a6",
  "#f472b6",
];

export function chartTheme(isDark: boolean) {
  return {
    isDark,
    text: isDark ? "#e8eef8" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    primary: isDark ? "#7aa2ff" : "#3b6cf5",
  };
}

export function typeLabel(mimetype: string): string {
  if (!mimetype) return "Unknown";
  const [kind, subtype = ""] = mimetype.split("/");
  if (kind === "image") return "Images";
  if (kind === "video") return "Videos";
  if (kind === "audio") return "Audio";
  if (subtype === "pdf") return "PDF";
  if (kind === "text") return "Text";
  if (subtype.includes("zip") || subtype.includes("compressed")) return "Archives";
  return subtype.replace("vnd.", "").slice(0, 18) || kind;
}

/** Merge raw mimetypes into a few readable buckets. */
export function groupTypes(types: FileTypeStat[]): FileTypeStat[] {
  const buckets = new Map<string, FileTypeStat>();
  for (const item of types) {
    const label = typeLabel(item.mimetype);
    const current = buckets.get(label);
    if (current) {
      current.count += item.count;
      current.bytes += item.bytes;
    } else {
      buckets.set(label, { mimetype: label, count: item.count, bytes: item.bytes });
    }
  }
  return [...buckets.values()].sort((a, b) => b.count - a.count);
}

/** Fill missing days so the last 30 days are a continuous series. */
export function last30Days(history: HistoryPoint[]): HistoryPoint[] {
  const byDay = new Map(
    history.map((point) => [point.date.slice(0, 10), point])
  );
  const days: HistoryPoint[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    days.push(byDay.get(key) ?? { date: key, count: 0, bytes: 0 });
  }

  return days;
}

export function formatDay(value: string): string {
  const [, month, day] = value.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[Number(month) - 1]} ${Number(day)}`;
}

export function baseOptions(isDark: boolean): ApexOptions {
  const theme = chartTheme(isDark);
  return {
    chart: {
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
      foreColor: theme.muted,
    },
    colors: CHART_COLORS,
    grid: { borderColor: theme.grid, strokeDashArray: 4 },
    legend: { labels: { colors: theme.muted } },
    dataLabels: { enabled: false },
    tooltip: { theme: isDark ? "dark" : "light" },
    stroke: { curve