import Link from "next/link";
import { Folder, File, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pathToPublicUrl, encodeUrlPath } from "@/lib/utils";
import { formatSize } from "lib/utils/format"

/*
 * TODO:
 * Sholud be refectored or rewrite
 * It was done in hurry
 */

interface FolderItem {
  name: string;
  path: string;
  title: string;
  items: FolderItem[] | FileItem[];
  items_count: number;
  url: string;
}

interface FileItem {
  id: number;
  user: string;
  title: string;
  path: string;
  views: number;
  size: number;
  blob_hash: string | null;
  type: string;
  mode: string;
  visibility: string;
  password: string | null;
  locked: boolean;
  as_guest: boolean;
  modified: string;
  content: string | null;
}

type ExplorerItem = FolderItem | FileItem;

interface FolderResponse {
  name: string;
  path: string;
  title?: string;
  items: ExplorerItem[];
  items_count: number;
  url?: string;
}


function isFolder(item: ExplorerItem): item is FolderItem {
  return "items" in item;
}

function ResultRow({ item }: { item: ExplorerItem }) {
  const folder = isFolder(item);

  const title = item.title || item.path.split("/").filter(Boolean).pop() || "Untitled";
  const url = pathToPublicUrl(encodeUrlPath(item.path));
  const sourceUrl = folder ? null : `/src${item.path}`;
  const viewLinkTarget = folder ? "" : "_blank";

  const Icon = folder ? Folder : File;

  return (
    <div className="flex items-center gap-3 border-b border-border/40 p-3 last:border-b-0 hover:bg-foreground/5">

      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Name and path */}
      <Link
        href={url}
        target={viewLinkTarget}
        rel="noopener noreferrer"
        className="group min-w-0 flex-1"
        title={folder ? "Open folder" : "Open file"}
      >
        <p className="flex items-center gap-1 truncate text-sm font-medium group-hover:text-primary">
          <span className="truncate">{title}</span>

          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </p>

        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {item.path}
        </p>
      </Link>

      {/* Metadata */}
      <div className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
        {folder ? (
          <span>Folder · {item.items_count} items</span>
        ) : (
          <>
            <span className="capitalize">{item.type}</span>
            <span>{formatSize(item.size)}</span>
            <span>{new Date(item.modified).toLocaleDateString()}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          asChild
        >
          <Link
            href={url}
            target={viewLinkTarget}
            rel="noopener noreferrer"
          >
            View
          </Link>
        </Button>

        {sourceUrl && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            asChild
          >
            <Link href={sourceUrl}>Src</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function FileExplorer({
  data,
}: {
  data: FolderResponse;
}) {
  return (
    <div className="w-full min-w-0">

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold">
          {data.title || data.name}
        </h2>

        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
          {data.path}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {data.items_count} items
        </p>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-lg border border-border/40">
        {data.items.map((item) => (
          <ResultRow
            key={isFolder(item) ? item.path : item.id}
            item={item}
          />
        ))}

        {data.items.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            This folder is empty.
          </div>
        )}
      </div>
    </div>
  );
}

