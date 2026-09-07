import { API_URL } from "@/lib/axios";
import { adminToken, jsonFromUpstream, unreachable } from "../../_proxy";

/** GET /api/stats/admin — system-wide statistics, admins only. */
export async function GET() {
  const auth = await adminToken();
  if (!auth.ok) return auth.response;

  try {
    const upstream = await fetch(`${API_URL}/stats/admin`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
