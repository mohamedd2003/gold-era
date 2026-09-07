import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/axios";
import { getAuthToken } from "@/lib/authToken";
import { jsonFromUpstream, unauthorized, unreachable } from "../_proxy";

/** GET /api/files — proxies the paginated file list. */
export async function GET(request: NextRequest) {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  try {
    const upstream = await fetch(
      `${API_URL}/files${request.nextUrl.search}`,
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

/** POST /api/files — proxies a multipart upload. */
export async function POST(request: NextRequest) {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "A file is required" },
      { status: 400 }
    );
  }

  // Rebuild the body so fetch generates its own multipart boundary.
  const forwarded = new FormData();
  forwarded.append("file", file, file.name);

  try {
    const upstream = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: forwarded,
      cache: "no-store",
    });
    return jsonFromUpstream(upstream);
  } catch {
    return unreachable();
  }
}
