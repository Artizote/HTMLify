"use client";

import { Download, ExternalLink } from "lucide-react";

import { FileIcon } from "@/components/dashboard/file-icon";
import { Button } from "@/components/ui/button";
import { TmpFolderFile } from "@/lib/tmp-folder/tmp-folder.types";
import { downloadFile } from "@/lib/utils/actions";

export function ListFiles({
  files,
  selectedId,
  onSelect,
}: {
  files: TmpFolderFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto font-mono text-sm">
      {files.map((file) => {
        const active = file.id === selectedId;
        return (
          <div
            key={file.id}
            className={`flex items-center border-l-2 transition-colors ${
              active
                ? "border-primary bg-primary/10"
                : "border-transparent hover:border-foreground/20 hover:bg-muted"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(file.id)}
              title={file.name}
              className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left"
            >
              <FileIcon path={file.name} />
              <span
                className={`min-w-0 flex-1 truncate ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {file.name}
              </span>
            </button>
            <div className="flex shrink-0 items-center pr-1.5">
              <Button
                variant="ghost"
                size="icon-xs"
                title="Download"
                onClick={() => downloadFile(file.url, file.name)}
                className="text-muted-foreground"
              >
                <Download className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                asChild
                title="Open"
                className="text-muted-foreground"
              >
                <a href={file.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
