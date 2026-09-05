import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { Role } from "../generated/prisma/client";
import { userController } from "../controllers/user.controller";
import {
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validations/user.validation";

const router = Router();

// All user-management routes require an authenticated admin.
router.use(authenticate, authorize(Role.ADMIN));

router.get("/", validate({ query: listUsersQuerySchema }), userController.list);
router.patch(
  "/:id",
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  userController.update
);
router.delete(
  "/:id",
  validate({ params: userIdParamSchema }),
  userController.remove
);

export default router;
