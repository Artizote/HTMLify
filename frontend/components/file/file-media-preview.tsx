"use client";

import { Music } from "lucide-react";

import { cn } from "@/lib/utils";

export type MediaPreviewType = "img" | "video" | "audio";

interface FileMediaPreviewProps {
  fileType: MediaPreviewType;
  url: string;
  name?: string;
  plain?: boolean;
  className?: string;
}

export function FileMediaPreview({
  fileType,
  url,
  name,
  plain = false,
  className,
}: FileMediaPreviewProps) {
  const box = plain
    ? "flex h-full w-full items-center justify-center"
    : "relative flex min-h-75 w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/10 p-2 shadow-sm";

  if (fileType === "audio") {
    return (
      <div
        className={cn(
          plain
            ? "flex h-full flex-col items-center justify-center gap-6 px-8 py-12"
            : "flex flex-col items-center justify-center gap-6 rounded-xl border border-border/50 bg-muted/10 p-8 shadow-sm",
          className,
        )}
      >
        <div className="rounded-full border border-border/50 bg-background p-4 shadow-sm">
          <Music className="h-8 w-8 text-primary/70" />
        </div>
        <audio
          src={url}
          controls
          className="w-full max-w-md focus:outline-none"
        />
      </div>
    );
  }

  if (fileType === "video") {
    return (
      <div className={cn(box, className)}>
        <video
          src={url}
          controls
          className="max-h-full max-w-full rounded-sm object-contain focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className={cn(box, "p-4", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name ?? ""}
        className="max-h-full max-w-full object-contain text-transparent"
      />
    </div>
  );
}
