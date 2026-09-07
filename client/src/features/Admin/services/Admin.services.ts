import { nextApi } from "@/lib/axios";
import type { ApiSuccess } from "@/types";
import type {
  HistorySeries,
  StatsPeriod,
} from "@/features/Analytics/types/Analytics.types";
import type {
  AdminStats,
  ManagedUser,
  ManagedUsersPage,
} from "../types/Admin.types";
import {
  listUsersParamsSchema,
  updateUserSchema,
  userIdSchema,
  type ListUsersParams,
  type UpdateUserInput,
} from "../validation/Admin.validation";

/** GET /api/users */
export async function listUsers(
  params: ListUsersParams = {}
): Promise<ManagedUsersPage> {
  const query = listUsersParamsSchema.parse(params);
  const { data } = await nextApi.get<ApiSuccess<ManagedUser[]>>("/users", {
    params: query,
  });
  return { items: data.data, meta: data.meta };
}

/** PATCH /api/users/:id */
export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<ManagedUser> {
  const body = updateUserSchema.parse(input);
  const { data } = await nextApi.patch<ApiSuccess<ManagedUser>>(
    `/users/${userIdSchema.parse(id)}`,
    body
  );
  return data.data;
}

/** DELETE /api/users/:id */
export async function deleteUser(id: number): Promise<void> {
  await nextApi.delete(`/users/${userIdSchema.parse(id)}`);
}

/** GET /api/stats/admin */
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await nextApi.get<ApiSuccess<AdminStats>>("/stats/admin");
  return data.data;
}

/** GET /api/stats/admin/history?period= */
export async function getAdminHistory(
  period: StatsPeriod
): Promise<HistorySeries> {
  const { data } = await nextApi.get<ApiSuccess<HistorySeries>>(
    "/stats/admin/history",
    { params: { period } }
  );
  return data.data;
}
