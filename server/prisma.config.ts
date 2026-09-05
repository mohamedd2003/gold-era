import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback lets `prisma generate` run during npm install before env is injected.
    url: process.env.DATABASE_URL ?? "mysql://root@127.0.0.1:3306/gold_era",
  },
});
