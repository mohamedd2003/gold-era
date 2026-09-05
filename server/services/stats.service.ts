import {
  StatsRepository,
  statsRepository,
  type HistoryPoint,
  type MimetypeGroup,
  type RecentUpload,
} from "../repositories/stats.repository";

export interface UserStats {
  totalFiles: number;
  storageUsageBytes: number;
  fileTypes: MimetypeGroup[];
  uploadHistory: HistoryPoint[];
}

export interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  storageUsageBytes: number;
  topFileTypes: MimetypeGroup[];
  recentUploads: RecentUpload[];
}

export class StatsService {
  constructor(private readonly repo: StatsRepository = statsRepository) {}

  async forUser(userId: number): Promise<UserStats> {
    const where = { userId };
    const [totalFiles, storageUsageBytes, fileTypes, uploadHistory] =
      await Promise.all([
        this.repo.countFiles(where),
        this.repo.totalStorage(where),
        this.repo.mimetypeDistribution(where),
        this.repo.uploadHistory(userId),
      ]);

    return { totalFiles, storageUsageBytes, fileTypes, uploadHistory };
  }

  async forAdmin(): Promise<AdminStats> {
    const [totalUsers, totalFiles, storageUsageBytes, topFileTypes, recentUploads] =
      await Promise.all([
        this.repo.countUsers(),
        this.repo.countFiles(),
        this.repo.totalStorage(),
        this.repo.mimetypeDistribution({}, 5),
        this.repo.recentUploads(10),
      ]);

    return {
      totalUsers,
      totalFiles,
      storageUsageBytes,
      topFileTypes,
      recentUploads,
    };
  }
}

export const statsService = new StatsService();
