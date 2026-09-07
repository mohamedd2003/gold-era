import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
} from "lucide-react";

/**
 * Picks an icon from the mimetype (falling back to the extension for archives).
 * Returns the element directly so no component is created during render.
 */
export function FileTypeIcon({
  mimetype,
  name,
  className = "size-4",
}: {
  mimetype: string;
  name: string;
  className?: string;
}) {
  if (mimetype.startsWith("image/")) return <FileImage className={className} />;
  if (mimetype.startsWith("video/")) return <FileVideo className={className} />;
  if (mimetype.startsWith("audio/")) return <FileAudio className={className} />;
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) {
    return <FileArchive className={className} />;
  }
  if (mimetype === "application/pdf" || mimetype.startsWith("text/")) {
    return <FileText className={className} />;
  }
  return <FileIcon className={className} />;
}
