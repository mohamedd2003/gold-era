import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/ApiResponse";
import { UnauthorizedError } from "../errors/HttpError";
import { statsService, type StatsService } from "../services/stats.service";
import type { StatsPeriod } from "../validations/stats.validation";

export class StatsController {
  constructor(private readonly service: StatsService = statsService) {}

  userStats = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const stats = await this.service.forUser(req.user.id);
    sendSuccess(res, stats, "User statistics fetched successfully");
  });

  userHistory = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const period = (req.validatedQuery as { period: StatsPeriod }).period;
    const history = await this.service.historyForUser(req.user.id, period);
    sendSuccess(res, history, "User upload history fetched successfully");
  });

  adminStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await this.service.forAdmin();
    sendSuccess(res, stats, "System statistics fetched successfully");
  });
}

export const statsController = new StatsController();
