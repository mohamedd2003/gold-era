import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env";
import { BadRequestError } from "../errors/HttpError";

const uploadRoot = path.resolve(process.cwd(), env.uploads.dir);

// Ensure the upload directory exists at startup.
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.uploads.maxFileSizeBytes },
  fileFilter: (_req, file, cb) => {
    // Reject obviously dangerous executables; extend as needed.
    const blocked = [".exe", ".bat", ".cmd", ".sh", ".msi"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (blocked.includes(ext)) {
      cb(new BadRequestError(`File type ${ext} is not allowed`));
      return;
    }
    cb(null, true);
  },
});

export const UPLOAD_ROOT = uploadRoot;
