import { FileType } from "@/lib/modules/file/file.schema";

export function detectFileType(file: File): FileType {
  if (file.type.startsWith("image/")) return "img";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "other";
}
