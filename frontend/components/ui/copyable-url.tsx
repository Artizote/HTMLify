"use client";

import { Check, Copy, ExternalLink, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { shareContent, useClipboard } from "@/lib/utils/actions";

interface CopyableUrlProps {
  url: string;
  showShare?: boolean;
  showOpen?: boolean;
  className?: string;
}

export function CopyableUrl({
  url,
  showShare = false,
  showOpen = false,
  className,
}: CopyableUrlProps) {
  const { copied, copy } = useClipboard(url);

  const share = () => {
    void shareContent({ url, fallbackCopy: true });
  };

  const iconButton =
    "shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 py-1.5 pl-3 pr-1.5",
        className,
      )}
    >
      <span className="min-w-0 flex-1 select-all truncate font-mono text-sm text-foreground">
        {url}
      </span>
      {showShare && (
        <button type="button" onClick={share} title="Share" className={iconButton}>
          <Share2 className="size-3.5" />
        </button>
      )}
      {showOpen && (
        <button
          type="button"
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          title="Open"
          className={iconButton}
        >
          <ExternalLink className="size-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={copy}
        title={copied ? "Copied" : "Copy"}
        className={iconButton}
      >
        {copied ? (
          <Check className="size-3.5 text-primary" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
}