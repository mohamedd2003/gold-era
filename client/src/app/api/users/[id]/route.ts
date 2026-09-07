import { API_URL } from "@/lib/axios";
import { adminToken, jsonFromUpstream, unreachable } from "../../_proxy";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/users/:id — admin-only role / profile update. */
export async function PATCH(request: Request, { params }: Context) {
  const auth = await adminToken();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await request.text();

  try {
    const upstream = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}

/** DELETE /api/users/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const auth = await adminToken();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    const upstream = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
