import axios from "axios";

function trimUrl(value?: string) {
  return value?.replace(/\/$/, "") || undefined;
}

/**
 * Express API base, including `/api/v1`.
 * Browser / Vercel builds use `NEXT_PUBLIC_API_URL`.
 * Next.js server code in Docker can override with `INTERNAL_API_URL`
 * (e.g. http://server:8080/api/v1) so it does not call localhost inside
 * the container.
 */
export const API_URL =
  trimUrl(process.env.INTERNAL_API_URL) ??
  trimUrl(process.env.NEXT_PUBLIC_API_URL);

export function missingApiUrlMessage() {
  return "NEXT_PUBLIC_API_URL is not set on this deployment. Add it in Vercel → Settings → Environment Variables and redeploy.";
}

export const api = axios.create({
  baseURL: API_URL,
});

/**
 * Browser-side instance pointed at our own Next route handlers. They read the
 * httpOnly cookie server-side and forward the Bearer token to Express, so the
 * client never needs access to the token.
 */
export const nextApi = axios.create({
  baseURL: "/api",
});

export default api;
