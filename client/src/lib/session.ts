import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { API_URL } from "@/lib/axios";
import { isAdminRole, normalizeRole } from "@/lib/role";
import type { ApiSuccess, User } from "@/types";

export type SessionUser = User;

export function isAdmin(user: User | null): boolean {
  return isAdminRole(user?.role);
}

export const getSessionUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("gold_era_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as
      | ApiSuccess<User>
      | null;
    if (!body?.success || !body.data) return null;
    return { ...body.data, role: normalizeRole(body.data.role) };
  } catch {
    return null;
  }
});

/** Signed-in gate for dashboard pages. */
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Admin gate for pages. Non-admins get a 404 rather than a redirect so the
 * existence of the admin area is not advertised. Express enforces the same
 * rule on every underlying endpoint.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!isAdmin(user)) notFound();
  return user;
}
