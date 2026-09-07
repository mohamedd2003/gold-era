import type { StoredFile } from "../types/UploadFiles.types";

export const FOLDER_IDS = [
  "documents",
  "projects",
  "photos",
  "designs",
] as const;

export type FolderId = (typeof FOLDER_IDS)[number];

export const FOLDERS: { id: FolderId; label: string; type: string }[] = [
  { id: "documents", label: "Documents", type: "pdf" },
  { id: "projects", label: "Projects", type: "zip" },
  { id: "photos", label: "Photos", type: "image" },
  { id: "designs", label: "Designs", type: "svg" },
];

/** Server `type` query values — matched against mimetype. */
export const TYPE_FILTERS = [
  { value: "", label: "All types" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "pdf", label: "PDF" },
  { value: "text", label: "Text" },
  { value: "zip", label: "Archives" },
  { value: "svg", label: "Designs" },
] as const;

export const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
  { value: "originalName:asc", label: "Name A–Z" },
  { value: "originalName:desc", label: "Name Z–A" },
  { value: "size:desc", label: "Largest" },
  { value: "size:asc", label: "Smallest" },
] as const;

const DESIGN_EXT = /\.(svg|psd|ai|fig|sketch|xd|eps|indd|xd)$/i;
const PROJECT_EXT =
  /\.(zip|rar|7z|tar|gz|js|ts|tsx|jsx|json|py|java|go|rs|php|cs|cpp|c|html|css|yml|yaml|toml)$/i;

/** Groups a stored file into the four dashboard folders. */
export function folderFor(file: StoredFile): FolderId {
  const name = file.originalName;
  const mime = file.mimetype.toLowerCase();

  if (DESIGN_EXT.test(name) || mime.includes("svg") || mime.includes("postscript")) {
    return "designs";
  }
  if (mime.startsWith("image/")) return "photos";
  if (
    mime.startsWith("video/") ||
    mime.startsWith("audio/") ||
    mime.includes("zip") ||
    mime.includes("compressed") ||
    PROJECT_EXT.test(name)
  ) {
    return "projects";
  }
  return "documents";
}

export function countByFolder(files: StoredFile[]): Record<FolderId, number> {
  const counts = {
    documents: 0,
    projects: 0,
    photos: 0,
    designs: 0,
  } satisfies Record<FolderId, number>;

  for (const file of files) {
    counts[folderFor(file)] += 1;
  }
  return counts;
}

export function fileCountLabel(count: number): string {
  return `${count} ${count === 1 ? "file" : "files"}`;
}
