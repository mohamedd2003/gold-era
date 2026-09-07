import axios from "axios";

/**
 * Express API base, including `/api/v1`. Must be set on the Vercel project
 * (not only Railway) as `NEXT_PUBLIC_API_URL`, then the app must be redeployed.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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
