"use client";

import { Check, Copy, Download, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  copyToClipboard,
  downloadFile,
  shareContent,
} from "@/lib/utils/actions";

interface MediaActionsProps {
  /** Backend URL used for downloading the file */
  src: string;
  /** Frontend URL used for copy/share. Defaults to `src` if not provided. */
  copyUrl?: string;
  filename?: string;
  /** Optional class name for the wrapper */
  className?: string;
}

/**
 * Reusable actions bar for file/media previews — copy URL, download, and share.
 *
 * - `src` is the backend URL used for downloading.
 * - `copyUrl` (optional) is the frontend URL used for copy/share.
 *   When viewing on a page like `/src/...`, pass the page URL here so users
 *   copy/share the frontend link rather than the raw backend URL.
 */
export function MediaActions({
  src,
  copyUrl,
  filename,
  className,
}: MediaActionsProps) {
  const [copied, setCopied] = useState(false);

  const urlForCopy = copyUrl ?? src;

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(urlForCopy, {
      successMessage: "URL copied to clipboard",
      errorMessage: "Failed to copy URL",
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(src, filename);
  };

  const handleShare = () => {
    shareContent({
      title: filename || "Shared file",
      url: urlForCopy,
      fallbackCopy: true,
    });
  };

  return (
    <div className={`flex items-center justify-end gap-1 ${className ?? ""}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyUrl}
        className="gap-1.5 text-muted-foreground"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {copied ? "Copied" : "Copy URL"}
        </span>
      </Button>

      <Separator orientation="vertical" className="h-5" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="text-muted-foreground"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </Button>

      <Separator orientation="vertical" className="h-5" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-muted-foreground"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
    </div>
  );
}
