"use client";

import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { useClipboard } from "@/lib/utils/actions";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className,
}: CopyButtonProps) {
  const { copied, copy } = useClipboard(value);

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? copiedLabel : label}
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/20",
        className,
      )}
    >
      {copied ? (
        <Check size={14} className="text-primary" />
      ) : (
        <Copy
          size={14}
          className="text-muted-foreground transition-colors group-hover:text-foreground"
        />
      )}
      <span
        className={cn(
          "text-xs text-muted-foreground transition-colors group-hover:text-foreground",
          copied && "text-primary",
        )}
      >
        {copied ? copiedLabel : label}
      </span>
    </button>
  );
}