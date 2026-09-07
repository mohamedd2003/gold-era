import { cookies } from "next/headers";
import { API_URL } from "@/lib/axios";
import type { ApiSuccess, User } from "@/types";

export type SessionUser = User;

export async function getSessionUser(): Promise<User | null> {
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
    return body?.success ? body.data : null;
  } catch {
    return null;
  }
}
