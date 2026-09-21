import {
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Folder,
} from "lucide-react";

interface Props {
  path: string;
}

const colors: Record<string, { icon: typeof FileCode; className: string }> = {
  css: { icon: FileCode, className: "text-purple-400" },
  scss: { icon: FileCode, className: "text-pink-400" },
  sass: { icon: FileCode, className: "text-pink-400" },
  html: { icon: FileCode, className: "text-orange-400" },
  htm: { icon: FileCode, className: "text-orange-400" },
  js: { icon: FileCode, className: "text-yellow-400" },
  mjs: { icon: FileCode, className: "text-yellow-400" },
  ts: { icon: FileCode, className: "text-blue-400" },
  tsx: { icon: FileCode, className: "text-cyan-400" },
  jsx: { icon: FileCode, className: "text-sky-400" },
  json: { icon: FileCode, className: "text-lime-400" },
  md: { icon: FileText, className: "text-slate-300" },
  png: { icon: FileImage, className: "text-pink-400" },
  jpg: { icon: FileImage, className: "text-orange-400" },
  jpeg: { icon: FileImage, className: "text-orange-400" },
  svg: { icon: FileImage, className: "text-amber-400" },
  gif: { icon: FileImage, className: "text-fuchsia-400" },
  webp: { icon: FileImage, className: "text-teal-400" },
  mp3: { icon: FileAudio, className: "text-cyan-400" },
  wav: { icon: FileAudio, className: "text-sky-400" },
  ogg: { icon: FileAudio, className: "text-blue-400" },
  mp4: { icon: FileVideo, className: "text-rose-400" },
  webm: { icon: FileVideo, className: "text-red-400" },
  mov: { icon: FileVideo, className: "text-violet-400" },
  pdf: { icon: FileText, className: "text-red-400" },
  txt: { icon: FileText, className: "text-slate-300" },
};

export function FileIcon({ path }: Props) {
  const p = path.toLowerCase();
  const lastSegment = p.split("/").filter(Boolean).pop() ?? "";
  const ext = lastSegment.includes(".") ? lastSegment.split(".").pop() : null;

  if (!ext) {
    return (
      <Folder className="h-4 w-4 text-blue-400 shrink-0" fill="currentColor" />
    );
  }

  const entry = colors[ext] ?? {
    icon: FileText,
    className: "text-muted-foreground",
  };
  const Icon = entry.icon;

  return <Icon className={`h-4 w-4 shrink-0 ${entry.className}`} />;
}
