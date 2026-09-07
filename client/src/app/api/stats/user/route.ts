import { API_URL } from "@/lib/axios";
import { getAuthToken } from "@/lib/authToken";
import { jsonFromUpstream, unauthorized, unreachable } from "../../_proxy";

/** GET /api/stats/user — proxies the signed-in user's file analytics. */
export async function GET() {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(`${API_URL}/stats/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
