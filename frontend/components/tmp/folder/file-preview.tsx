"use client";

import Link from "next/link";
import { useState } from "react";

import { FilePreview } from "@/components/file/file-preview";
import { Button } from "@/components/ui/button";
import { getFileContentType } from "@/lib/modules/file/file.utils";
import { TmpFolderFile } from "@/lib/tmp-folder/tmp-folder.types";
import { copyToClipboard } from "@/lib/utils/actions";

import { formatExpiry, formatExpiryDelta, isExpired } from "./utils";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const done = async () => {
    if (await copyToClipboard(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <button
      onClick={done}
      className="text-xs px-2 py-0.5 font-mono border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

export function FileMetadata({
  file,
  index,
}: {
  file: TmpFolderFile;
  index: number;
}) {
  const fileType = getFileContentType(file.name);
  const canPreview = fileType !== "other";
  const expired = isExpired(file.expiry);

  return (
    <div className="flex h-full flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap border-b border-border px-4 py-2 font-mono">
        <span className="font-mono text-xs text-muted-foreground">
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span className="truncate max-w-[40%] text-sm text-foreground">
          {file.name}
        </span>
        <span className="text-xs  hidden sm:inline">
          {formatExpiry(file.expiry)}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded-md border ${
              expired
                ? "border-destructive/50 text-destructive"
                : "border-primary/30 text-primary/80"
            }`}
          >
            {formatExpiryDelta(file.expiry)}
          </span>
          <span className="flex items-center gap-1">
            <Button size="sm" asChild>
              <Link href={file.url} target="_blank" rel="noreferrer">
                open ↗
              </Link>
            </Button>
            <CopyButton value={file.url} />
          </span>
        </span>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        {canPreview ? (
          <FilePreview
            plain
            fileType={fileType}
            mediaUrl={file.url}
            path={file.name}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              no inline preview for this file type
            </p>
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-primary hover:underline"
            >
              download / open file ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rotate-45 border border-primary/40 rounded-sm" />
        <div className="absolute inset-3 rounded-sm border border-dashed border-border" />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-primary">
          ↳
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-mono text-base text-foreground">select a file</p>
        <p className="font-mono text-sm text-muted-foreground">
          choose a file from the list to inspect its{" "}
          <span className="text-primary">metadata</span>
        </p>
      </div>
    </div>
  );
}
