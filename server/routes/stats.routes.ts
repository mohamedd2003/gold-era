import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerified,
} from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma/client";
import { validate } from "../middlewares/validate.middleware";
import { statsController } from "../controllers/stats.controller";
import { statsPeriodSchema } from "../validations/stats.validation";

const router = Router();

router.get(
  "/user",
  authenticate,
  requireVerified,
  statsController.userStats
);
router.get(
  "/user/history",
  authenticate,
  requireVerified,
  validate({ query: statsPeriodSchema }),
  statsController.userHistory
);
router.get(
  "/admin",
  authenticate,
  authorize(Role.ADMIN),
  statsController.adminStats
);
router.get(
  "/admin/history",
  authenticate,
  authorize(Role.ADMIN),
  validate({ query: statsPeriodSchema }),
  statsController.adminHistory
);

export default router;
