import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
