import {
  FileText,
  Folder,
  FileCode,
  FileImage,
  FileAudio,
  FileVideo,
} from "lucide-react";

interface Props {
  path: string;
}

export function FileIcon({ path }: Props) {
  const p = path.toLowerCase();
  const lastSegment = p.split("/").filter(Boolean).pop() ?? "";
  const ext = lastSegment.includes(".") ? lastSegment.split(".").pop() : null;

  switch (ext) {
    case "css":
      return <FileCode className="h-4 w-4 text-purple-400 shrink-0" />;
    case "html":
    case "htm":
      return <FileCode className="h-4 w-4 text-orange-400 shrink-0" />;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
      return <FileCode className="h-4 w-4 text-yellow-400 shrink-0" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "gif":
    case "webp":
      return <FileImage className="h-4 w-4 text-pink-400 shrink-0" />;
    case "mp3":
    case "wav":
    case "ogg":
      return <FileAudio className="h-4 w-4 text-cyan-400 shrink-0" />;
    case "mp4":
    case "webm":
    case "mov":
      return <FileVideo className="h-4 w-4 text-rose-400 shrink-0" />;
    case null:
      return <Folder className="h-4 w-4 text-blue-400 shrink-0" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}
