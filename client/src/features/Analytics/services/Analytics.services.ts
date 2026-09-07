import axios from "axios";
import { nextApi } from "@/lib/axios";
import type { ApiError, ApiSuccess } from "@/types";
import type {
  HistorySeries,
  StatsPeriod,
  UserStats,
} from "../types/Analytics.types";

/** GET /api/stats/user */
export async function getUserStats(): Promise<UserStats> {
  const { data } = await nextApi.get<ApiSuccess<UserStats>>("/stats/user");
  return data.data;
}

/** GET /api/stats/user/history?period= */
export async function getUploadHistory(
  period: StatsPeriod
): Promise<HistorySeries> {
  const { data } = await nextApi.get<ApiSuccess<HistorySeries>>(
    "/stats/user/history",
    { params: { period } }
  );
  return data.data;
}

export function statsErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return (
      error.response?.data?.details?.[0]?.message ??
      error.response?.data?.message ??
      fallback
    );
  }
  return error instanceof Error ? error.message : fallback;
}
