export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Short label for a mimetype, e.g. "PNG image" or "PDF document". */
export function formatFileType(mimetype: string, name: string): string {
  if (!mimetype) {
    const ext = name.includes(".") ? name.split(".").pop() : "";
    return ext ? `.${ext.toLowerCase()}` : "Unknown";
  }
  const [kind, subtype = ""] = mimetype.split("/");
  const pretty = subtype.replace("vnd.", "").replace(/[-.+].*$/, "").toUpperCase();
  if (kind === "image") return `${pretty || "Image"} image`;
  if (kind === "video") return `${pretty || "Video"} video`;
  if (kind === "audio") return `${pretty || "Audio"} audio`;
  if (subtype === "pdf") return "PDF document";
  if (kind === "text") return `${pretty || "Text"} document`;
  return mimetype;
}
