import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/ApiResponse";
import { UnauthorizedError } from "../errors/HttpError";
import { statsService, type StatsService } from "../services/stats.service";

export class StatsController {
  constructor(private readonly service: StatsService = statsService) {}

  userStats = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const stats = await this.service.forUser(req.user.id);
    sendSuccess(res, stats, "User statistics fetched successfully");
  });

  adminStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await this.service.forAdmin();
    sendSuccess(res, stats, "System statistics fetched successfully");
  });
}

export const statsController = new StatsController();
