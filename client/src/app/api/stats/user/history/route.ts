import { type NextRequest } from "next/server";
import { API_URL } from "@/lib/axios";
import { getAuthToken } from "@/lib/authToken";
import { jsonFromUpstream, unauthorized, unreachable } from "../../../_proxy";

/** GET /api/stats/user/history?period=daily */
export async function GET(request: NextRequest) {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(
      `${API_URL}/stats/user/history${request.nextUrl.search}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
