import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gold-era-production-a530.up.railway.app/api/v1";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
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
      | { success: boolean; data: SessionUser }
      | null;
    return body?.success ? body.data : null;
  } catch {
    return null;
  }
}
