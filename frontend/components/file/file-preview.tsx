import { Music } from "lucide-react";

import { FileType } from "@/lib/modules/file/file.types";
import { getLanguageByPath } from "@/lib/modules/playgournd/editor.utils";

import CodeEditor from "../playgroud/code-editor";

const getCacheBustedUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
};

interface FilePreviewProps {
  fileType: FileType;
  path: string;
  code?: string;
  onChange?: (code: string) => void;
  mediaUrl?: string | null;
  plain?: boolean;
}

export function FilePreview({
  fileType,
  path,
  code,
  onChange,
  mediaUrl,
  plain = false,
}: FilePreviewProps) {
  const finalUrl = getCacheBustedUrl(mediaUrl || path);

  switch (fileType) {
    case "binary":
      return (
        <div
          className={
            plain
              ? "flex flex-col items-center justify-center gap-6 px-8 py-12"
              : "flex flex-col items-center justify-center gap-6 rounded-xl border border-border/50 bg-muted/10 p-8 shadow-sm"
          }
        >
          <p className="text-muted-foreground">can&apos;t preview this file</p>
        </div>
      );
    case "img":
      return (
        <div
          className={
            plain
              ? "flex min-h-75 w-full items-center justify-center"
              : "relative flex min-h-75 w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/10 shadow-sm"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-full w-full object-contain text-transparent"
            src={finalUrl}
            alt={path}
          />
        </div>
      );
    case "video":
      return (
        <div
          className={
            plain
              ? "relative flex min-h-75 w-full items-center justify-center"
              : "relative flex min-h-75 w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-black/95 shadow-sm"
          }
        >
          <video
            src={finalUrl}
            controls
            className="h-full w-full object-contain focus:outline-none"
          />
        </div>
      );
    case "audio":
      return (
        <div
          className={
            plain
              ? "flex flex-col items-center justify-center gap-6 px-8 py-12"
              : "flex flex-col items-center justify-center gap-6 rounded-xl border border-border/50 bg-muted/10 p-8 shadow-sm"
          }
        >
          <div className="rounded-full border border-border/50 bg-background p-4 shadow-sm">
            <Music className="h-8 w-8 text-primary/70" />
          </div>
          <audio
            src={finalUrl}
            controls
            className="w-full max-w-md focus:outline-none"
          />
        </div>
      );
    default:
      return (
        <CodeEditor
          language={getLanguageByPath(path)}
          code={code || ""}
          onChange={onChange || (() => {})}
          path={path}
        />
      );
  }
}
