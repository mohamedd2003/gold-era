import { Router } from "express";
import {
  authenticate,
  requireVerified,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload.middleware";
import { fileController } from "../controllers/file.controller";
import { fileIdParamSchema, listFilesQuerySchema } from "../validations/file.validation";

const router = Router();

// Every file route requires an authenticated, verified user.
router.use(authenticate, requireVerified);

router.post("/upload", upload.single("file"), fileController.upload);
router.get("/", validate({ query: listFilesQuerySchema }), fileController.list);
router.get(
  "/:id",
  validate({ params: fileIdParamSchema }),
  fileController.getOne
);
router.delete(
  "/:id",
  validate({ params: fileIdParamSchema }),
  fileController.remove
);

export default router;
