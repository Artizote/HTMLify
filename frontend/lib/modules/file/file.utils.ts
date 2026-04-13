import { FileType } from "@/lib/modules/file/file.schema";

export const getFileContentType = (
  filename: string,
  contentTypeHeader?: string | null,
): FileType => {
  if (contentTypeHeader) {
    if (contentTypeHeader.startsWith("image/")) return "img";
    if (contentTypeHeader.startsWith("video/")) return "video";
    if (contentTypeHeader.startsWith("audio/")) return "audio";
    if (contentTypeHeader.startsWith("application/")) return "binary";
    if (contentTypeHeader.startsWith("font/")) return "binary";
    if (contentTypeHeader.startsWith("model/")) return "binary";
  }

  const ext = filename.split(".").pop()?.toLowerCase();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const videoExts = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  const audioExts = ["mp3", "wav", "aac", "flac"];
  const binaryExts = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "bz2",
    "exe",
    "dll",
    "so",
    "bin",
    "dmg",
    "iso",
    "apk",
    "sqlite",
    "db",
  ];

  if (ext && imageExts.includes(ext)) return "img";
  if (ext && videoExts.includes(ext)) return "video";
  if (ext && audioExts.includes(ext)) return "audio";
  if (ext && binaryExts.includes(ext)) return "binary";

  return "other";
};
