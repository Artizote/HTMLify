import { Music } from "lucide-react";

import { FileType } from "@/lib/modules/file/file.types";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

import CodeEditor from "../playgroud/code-editor";

interface FilePreviewProps {
  fileType: FileType;
  path: string;
  code?: string;
  onChange?: (code: string) => void;
  mediaUrl?: string | null;
}
const getCacheBustedUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
};

export function FilePreview({
  fileType,
  path,
  code,
  onChange,
  mediaUrl,
}: FilePreviewProps) {
  const finalUrl = getCacheBustedUrl(mediaUrl || path);

  if (fileType === "binary") {
    return (
      <div
        className="w-full p-8 flex flex-col 
      items-center justify-center gap-6
      bg-linear-to-b from-muted/50 to-muted/10 
      rounded-xl border border-border/50 my-4 shadow-sm"
      >
        <p className="text-muted-foreground">can&apos;t preview this file</p>
      </div>
    );
  }
  if (fileType === "img") {
    return (
      <div
        className="relative w-full h-[60vh] min-h-75 
      flex items-center justify-center bg-muted/20 
      rounded-xl border border-border/50 overflow-hidden my-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-contain p-2"
          src={finalUrl}
          alt={path}
        />
      </div>
    );
  }
  if (fileType === "video") {
    return (
      <div
        className="relative w-full h-[60vh] min-h-75 
      flex items-center justify-center bg-black/95 
      rounded-xl border border-border/50 overflow-hidden my-4 shadow-sm"
      >
        <video
          src={finalUrl}
          controls
          className="w-full h-full object-contain focus:outline-none"
        />
      </div>
    );
  }
  if (fileType === "audio") {
    return (
      <div
        className="w-full p-8 flex flex-col items-center justify-center 
      gap-6 bg-linear-to-b from-muted/50 to-muted/10 
      rounded-xl border border-border/50 my-4 shadow-sm"
      >
        <div
          className="p-4 bg-background 
        rounded-full shadow-sm border 
        border-border/50"
        >
          <Music className="w-8 h-8 text-primary/70" />
        </div>
        <audio
          src={finalUrl}
          controls
          className="w-full max-w-md focus:outline-none"
        />
      </div>
    );
  }
  return (
    <CodeEditor
      code={code || ""}
      onChange={onChange || (() => {})}
      path={path}
      language={getLanguageByPath(path)}
    />
  );
}
