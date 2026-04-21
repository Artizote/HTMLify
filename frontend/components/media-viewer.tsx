"use client";

import { FileAudioIcon, FileImageIcon, FileVideoIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MediaType = "img" | "video" | "audio";

interface MediaViewerProps {
  src: string;
  type: MediaType;
  filename?: string;
  contentType?: string | null;
}

export function MediaViewer({
  src,
  type,
  filename,
  contentType,
}: MediaViewerProps) {
  const mimeLabel = contentType?.split(";")[0];

  return (
    <Card className="  gap-0  overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MediaIcon type={type} />
          {filename ?? src}
          {mimeLabel && (
            <span className="ml-auto shrink-0 text-muted-foreground/60">
              {mimeLabel}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-w-xl items-center justify-center p-4 bg-muted/20">
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
      </CardContent>
    </Card>
  );
}

function MediaIcon({ type }: { type: MediaType }) {
  const cls = "size-3.5 shrink-0";
  if (type === "video") return <FileVideoIcon className={cls} />;
  if (type === "audio") return <FileAudioIcon className={cls} />;
  return <FileImageIcon className={cls} />;
}
