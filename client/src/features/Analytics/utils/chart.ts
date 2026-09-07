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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function historyKey(date: Date, period: StatsPeriod): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  if (period === "hourly") return `${year}-${month}-${day} ${hour}:00`;
  if (period === "monthly") return `${year}-${month}`;
  if (period === "yearly") return String(year);
  return `${year}-${month}-${day}`;
}

/** Fill empty buckets so the selected period is a continuous series. */
export function fillHistory(
  history: HistoryPoint[],
  period: StatsPeriod
): HistoryPoint[] {
  const byKey = new Map(history.map((point) => [point.date.trim(), point]));
  const points: HistoryPoint[] = [];
  const cursor = new Date();

  if (period === "hourly") {
    cursor.setMinutes(0, 0, 0);
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(cursor);
      date.setHours(cursor.getHours() - offset);
      const key = historyKey(date, period);
      points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
    }
    return points;
  }

  if (period === "monthly") {
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(cursor);
      date.setMonth(cursor.getMonth() - offset);
      const key = historyKey(date, period);
      points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
    }
    return points;
  }

  if (period === "yearly") {
    cursor.setMonth(0, 1);
    cursor.setHours(0, 0, 0, 0);
    for (let offset = 4; offset >= 0; offset -= 1) {
      const date = new Date(cursor);
      date.setFullYear(cursor.getFullYear() - offset);
      const key = historyKey(date, period);
      points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
    }
    return points;
  }

  cursor.setHours(0, 0, 0, 0);
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - offset);
    const key = historyKey(date, "daily");
    points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
  }
  return points;
}

export function formatHistoryLabel(value: string, period: StatsPeriod): string {
  if (period === "hourly") {
    const hour = Number(value.slice(11, 13));
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12} ${suffix}`;
  }
  if (period === "monthly") {
    const [year, month] = value.split("-");
    return `${MONTHS[Number(month) - 1]} ${year}`;
  }
  if (period === "yearly") return value;
  const [, month, day] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
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
    stroke: { curve: "smooth" },
  };
}
