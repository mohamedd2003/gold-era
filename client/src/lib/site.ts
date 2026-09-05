/**
 * Canonical public origin used by sitemap, robots, and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://goldcloud.vercel.app).
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "Gold Cloud";

export const siteDescription =
  "Store, access, and share your files securely with Gold Cloud. Encrypted cloud storage and file management for teams.";
