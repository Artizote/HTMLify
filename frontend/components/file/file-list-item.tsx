import { ExternalLink, Trash2 } from "lucide-react";

import { FileIcon } from "@/components/dashboard/file-icon";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface FileListItemProps {
  name: string;
  size: number;
  progress: number;
  subtitle?: string;
  onOpen?: (e: React.MouseEvent) => void;
  onRemove?: (e: React.MouseEvent) => void;
}

export function FileListItem({
  name,
  size,
  progress,
  subtitle,
  onOpen,
  onRemove,
}: FileListItemProps) {
  const done = progress >= 100;

  return (
    <div className="flex items-center gap-3 p-2 relative border-b border-border/40 hover:bg-foreground/5">
      {!done && (
        <div
          style={{ width: `${progress}%` }}
          className="absolute h-full w-full left-0 top-0 bg-primary/15"
        />
      )}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <FileIcon path={name} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{name}</p>
        {subtitle && (
          <p className="truncate text-[11px] text-muted-foreground font-mono">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
      </div>
      {!done && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {progress}%
        </span>
      )}
      {onOpen && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Open"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-background hover:text-foreground"
          onClick={onOpen}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Remove"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
