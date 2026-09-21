"use client";

import { FileAudio as FileAudioIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FileIcon } from "./dashboard/file-icon";
import { MediaActions } from "./media-actions";

type MediaType = "img" | "video" | "audio";

interface MediaViewerProps {
  src: string;
  type: MediaType;
  filename?: string;
  contentType?: string | null;
  /** Frontend URL used for copy/share instead of the backend src */
  copyUrl?: string;
}

export function MediaViewer({
  src,
  type,
  filename,
  contentType,
  copyUrl,
}: MediaViewerProps) {
  const mimeLabel = contentType?.split(";")[0];

  return (
    <Card className="bg-muted/20 gap-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MediaIcon type={type} />
          <h1 className="text-muted-foreground">{filename ?? src}</h1>
          {mimeLabel && (
            <span className="ml-auto shrink-0 text-muted-foreground/60">
              {mimeLabel}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex min-w-lg items-center justify-center p-4">
          {type === "img" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={filename ?? ""}
              className="max-w-full max-h-[60vh] object-contain"
            />
          )}

          {type === "video" && (
            <video
              src={src}
              controls
              className="max-w-full max-h-[60vh] rounded-sm"
            >
              {contentType && <source src={src} type={contentType} />}
            </video>
          )}

          {type === "audio" && (
            <div className="flex flex-col items-center gap-4 py-8 w-full max-w-sm">
              <div className="flex items-center justify-center size-16 rounded-full bg-muted text-muted-foreground">
                <FileAudioIcon size={28} strokeWidth={1.5} />
              </div>
              <span className="text-xs text-muted-foreground font-mono truncate max-w-full">
                {filename ?? src}
              </span>
              <audio src={src} controls className="w-full">
                {contentType && <source src={src} type={contentType} />}
              </audio>
            </div>
          )}
        </div>

        <MediaActions
          src={src}
          copyUrl={copyUrl}
          filename={filename}
          className="px-4"
        />
      </CardContent>
    </Card>
  );
}

function MediaIcon({ type }: { type: MediaType }) {
  let path: string = type;
  switch (type) {
    case "video":
      path = ".mp4";
      break;
    case "audio":
      path = ".mp3";
      break;
    default:
      path = ".jpg";
      break;
  }
  return <FileIcon path={path} />;
}
