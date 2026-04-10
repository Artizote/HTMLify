import { FileType } from "@/lib/modules/file/file.schema";

export const getFileContentType = async (
  filename: string,
  contentTypeHeader?: string | null,
): Promise<FileType> => {
  if (contentTypeHeader) {
    if (contentTypeHeader.startsWith("image/")) return "img";
    if (contentTypeHeader.startsWith("video/")) return "video";
    if (contentTypeHeader.startsWith("audio/")) return "audio";
  }

  const ext = filename.split(".").pop()?.toLowerCase();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const videoExts = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  const audioExts = ["mp3", "wav", "aac", "flac"];

  if (ext && imageExts.includes(ext)) return "img";
  if (ext && videoExts.includes(ext)) return "video";
  if (ext && audioExts.includes(ext)) return "audio";

  return "other";
};
