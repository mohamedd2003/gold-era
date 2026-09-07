import { z } from "zod";

export const statsPeriodSchema = z.object({
  period: z.enum(["hourly", "daily", "monthly", "yearly"]).default("daily"),
});

export type StatsPeriod = z.infer<typeof statsPeriodSchema>["period"];

/** Start of the window used for time-series charts. */
export function periodSince(period: StatsPeriod): Date {
  const since = new Date();
  switch (period) {
    case "hourly":
      since.setHours(since.getHours() - 7);
      break;
    case "daily":
      since.setDate(since.getDate() - 7);
      break;
    case "monthly":
      since.setMonth(since.getMonth() - 12);
      break;
    case "yearly":
      since.setFullYear(since.getFullYear() - 5);
      break;
  }
  return since;
}
