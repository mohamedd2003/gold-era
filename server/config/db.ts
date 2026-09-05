import "dotenv/config";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to server/.env");
}

function createPool(databaseUrl: string): mariadb.Pool {
  const url = new URL(databaseUrl);
  const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;

  return mariadb.createPool({
    host,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "").split("?")[0],
    connectionLimit: 5,
    acquireTimeout: 8_000,
    connectTimeout: 5_000,
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: mariadb.Pool;
};

const pool = globalForPrisma.pool ?? createPool(connectionString);
const adapter = new PrismaMariaDb(pool);
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
