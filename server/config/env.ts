import "dotenv/config";

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function number(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  port: number("PORT", 5000),
  databaseUrl: required("DATABASE_URL"),
  jwt: {
    secret: required("JWT_SECRET", "GOLD_ERA"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  otp: {
    expiresMinutes: number("OTP_EXPIRES_MINUTES", 15),
  },
  uploads: {
    dir: process.env.UPLOAD_DIR ?? "uploads",
    maxFileSizeBytes: number("MAX_FILE_SIZE_MB", 25) * 1024 * 1024,
  },
  mail: {
    host: process.env.SMTP_HOST ?? "",
    port: number("SMTP_PORT", 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "Gold Era <noreply@localhost>",
  },
} as const;

export type Env = typeof env;
