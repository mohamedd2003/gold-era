import { type NextRequest } from "next/server";
import { API_URL } from "@/lib/axios";
import { adminToken, jsonFromUpstream, unreachable } from "../_proxy";

/** GET /api/users — admin-only paginated user list. */
export async function GET(request: NextRequest) {
  const auth = await adminToken();
  if (!auth.ok) return auth.response;

  try {
    const upstream = await fetch(`${API_URL}/users${request.nextUrl.search}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
