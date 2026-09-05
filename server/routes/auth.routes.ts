import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { authController } from "../controllers/auth.controller";
import {
  loginSchema,
  registerSchema,
  resendCodeSchema,
  verifyEmailSchema,
} from "../validations/auth.validation";

const router = Router();

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/verify-email", validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/resend-code", validate({ body: resendCodeSchema }), authController.resendCode);
router.get("/profile", authenticate, authController.profile);

export default router;
