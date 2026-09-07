import path from "node:path";
import { env } from "../config/env";

export function uploadRoot(): string {
  return path.resolve(process.cwd(), env.uploads.dir);
}

/** Candidate on-disk locations for a stored upload. */
export function resolveStoredPaths(file: {
  filename: string;
  path: string;
}): string[] {
  const root = uploadRoot();
  const fromName = path.join(root, file.filename);
  const fromPath = path.isAbsolute(file.path)
    ? file.path
    : path.join(root, file.path);
  return [...new Set([fromName, fromPath])];
}
