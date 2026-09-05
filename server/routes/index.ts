import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import fileRoutes from "./file.routes";
import statsRoutes from "./stats.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/files", fileRoutes);
router.use("/stats", statsRoutes);

export default router;
