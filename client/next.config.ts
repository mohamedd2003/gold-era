import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Standalone is for the Docker image. Vercel traces the app itself and
  // fails the build if this is set (`next-server.js.nft.json` missing).
  ...(!process.env.VERCEL ? { output: "standalone" as const } : {}),
};

export default nextConfig;
