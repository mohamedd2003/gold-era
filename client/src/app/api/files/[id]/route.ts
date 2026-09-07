import { API_URL } from "@/lib/axios";
import { getAuthToken } from "@/lib/authToken";
import { jsonFromUpstream, unauthorized, unreachable } from "../../_proxy";

type Context = { params: Promise<{ id: string }> };

/** GET /api/files/:id — single file metadata (includes extracted content). */
export async function GET(_request: Request, { params }: Context) {
  const token = await getAuthToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const upstream = await fetch(`${API_URL}/files/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}

/** DELETE /api/files/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const token = await getAuthToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const upstream = await fetch(`${API_URL}/files/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
