import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerified,
} from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma/client";
import { statsController } from "../controllers/stats.controller";

const router = Router();

router.get(
  "/user",
  authenticate,
  requireVerified,
  statsController.userStats
);
router.get(
  "/admin",
  authenticate,
  authorize(Role.ADMIN),
  statsController.adminStats
);

export default router;
