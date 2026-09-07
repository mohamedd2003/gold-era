import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/axios";
import { getAuthToken } from "@/lib/authToken";
import { jsonFromUpstream, unauthorized, unreachable } from "../../../_proxy";

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/files/:id/download — streams the raw file so it can be opened in a
 * new tab (`?download=1` forces a save dialog instead of an inline preview).
 */
export async function GET(request: NextRequest, { params }: Context) {
  const token = await getAuthToken();
  if (!token) return unauthorized();
  const { id } = await params;

  try {
    const upstream = await fetch(
      `${API_URL}/files/${id}/download${request.nextUrl.search}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!upstream.ok || !upstream.body) {
      return jsonFromUpstream(upstream);
    }

    const headers = new Headers();
    for (const header of [
      "content-type",
      "content-disposition",
      "content-length",
    ]) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }
    headers.set("Cache-Control", "private, no-store");

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return unreachable();
  }
}
