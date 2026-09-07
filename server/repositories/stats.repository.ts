import { BaseRepository } from "./base.repository";
import { Prisma } from "../generated/prisma/client";

export interface MimetypeGroup {
  mimetype: string;
  count: number;
  bytes: number;
}

export interface HistoryPoint {
  date: string;
  count: number;
  bytes: number;
}

export interface RecentUpload {
  id: number;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: Date;
  user: { id: number; name: string; email: string };
}

export class StatsRepository extends BaseRepository {
  countFiles(where: Prisma.FileWhereInput = {}): Promise<number> {
    return this.prisma.file.count({ where });
  }

  countUsers(where: Prisma.UserWhereInput = {}): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async totalStorage(where: Prisma.FileWhereInput = {}): Promise<number> {
    const result = await this.prisma.file.aggregate({
      where,
      _sum: { size: true },
    });
    return result._sum.size ?? 0;
  }

  async mimetypeDistribution(
    where: Prisma.FileWhereInput = {},
    limit?: number
  ): Promise<MimetypeGroup[]> {
    const groups = await this.prisma.file.groupBy({
      by: ["mimetype"],
      where,
      _count: { _all: true },
      _sum: { size: true },
      orderBy: { _count: { mimetype: "desc" } },
      ...(limit ? { take: limit } : {}),
    });

    return groups.map((group) => ({
      mimetype: group.mimetype,
      count: group._count._all,
      bytes: group._sum.size ?? 0,
    }));
  }

  /**
   * Upload counts and bytes grouped by the selected period.
   * hourly → last 7 hours, daily → last 7 days,
   * monthly → last 12 months, yearly → last 5 years.
   */
  async uploadHistory(
    userId: number | undefined,
    period: "hourly" | "daily" | "monthly" | "yearly" = "daily"
  ): Promise<HistoryPoint[]> {
    const bucket =
      period === "hourly"
        ? Prisma.sql`DATE_FORMAT(createdAt, '%Y-%m-%d %H:00')`
        : period === "monthly"
          ? Prisma.sql`DATE_FORMAT(createdAt, '%Y-%m')`
          : period === "yearly"
            ? Prisma.sql`DATE_FORMAT(createdAt, '%Y')`
            : Prisma.sql`DATE_FORMAT(createdAt, '%Y-%m-%d')`;

    // Prisma stores DateTime as UTC digits in DATETIME. Bucket and clip
    // against UTC so the series matches the client fillHistory keys.
    const since =
      period === "hourly"
        ? Prisma.sql`UTC_TIMESTAMP() - INTERVAL 7 HOUR`
        : period === "monthly"
          ? Prisma.sql`UTC_TIMESTAMP() - INTERVAL 12 MONTH`
          : period === "yearly"
            ? Prisma.sql`UTC_TIMESTAMP() - INTERVAL 5 YEAR`
            : Prisma.sql`UTC_TIMESTAMP() - INTERVAL 7 DAY`;

    const rows = await this.prisma.$queryRaw<
      Array<{ date: Date | string; count: bigint; bytes: bigint | null }>
    >(
      userId === undefined
        ? Prisma.sql`
            SELECT ${bucket} AS date, COUNT(*) AS count, COALESCE(SUM(size), 0) AS bytes
            FROM files
            WHERE createdAt >= ${since}
            GROUP BY ${bucket}
            ORDER BY date ASC`
        : Prisma.sql`
            SELECT ${bucket} AS date, COUNT(*) AS count, COALESCE(SUM(size), 0) AS bytes
            FROM files
            WHERE userId = ${userId} AND createdAt >= ${since}
            GROUP BY ${bucket}
            ORDER BY date ASC`
    );

    return rows.map((row) => ({
      date: normalizeHistoryDate(row.date, period),
      count: Number(row.count),
      bytes: Number(row.bytes ?? 0),
    }));
  }

  recentUploads(limit = 10): Promise<RecentUpload[]> {
    return this.prisma.file.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalName: true,
        mimetype: true,
        size: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Keep bucket keys in the same UTC format the charts fill against. */
function normalizeHistoryDate(
  value: Date | string,
  period: "hourly" | "daily" | "monthly" | "yearly"
): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (period === "hourly") {
      const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2})/);
      if (match) return `${match[1]} ${match[2]}:00`;
    }
    if (period === "monthly") {
      const match = trimmed.match(/^(\d{4}-\d{2})/);
      if (match) return match[1];
    }
    if (period === "yearly") {
      const match = trimmed.match(/^(\d{4})/);
      if (match) return match[1];
    }
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : trimmed;
  }

  const year = value.getUTCFullYear();
  const month = pad(value.getUTCMonth() + 1);
  const day = pad(value.getUTCDate());
  const hour = pad(value.getUTCHours());
  if (period === "hourly") return `${year}-${month}-${day} ${hour}:00`;
  if (period === "monthly") return `${year}-${month}`;
  if (period === "yearly") return String(year);
  return `${year}-${month}-${day}`;
}

export const statsRepository = new StatsRepository();
