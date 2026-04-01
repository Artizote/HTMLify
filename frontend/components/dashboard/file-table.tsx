"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FileItem, FolderItem, isFolderItem } from "@/shared/types";
import { DataTable } from "@/components/ui/data-table";
import { FileIcon } from "./file-icon";
import { Globe, Lock, Eye, Folder } from "lucide-react";
import Link from "next/link";
import { DashboardAction } from "@/components/dashboard/dashboard-action";

interface Props {
  items: (FileItem | FolderItem)[];
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function FileTable({ items }: Props) {
  const columns: ColumnDef<FileItem | FolderItem>[] = [
    {
      id: "name",
      accessorFn: (row) => {
        const name = isFolderItem(row)
          ? row.name || row.path.split("/").filter(Boolean).pop() || "Folder"
          : row.title ||
            row.path.split("/").filter(Boolean).pop() ||
            "Untitled";
        return `${name} ${row.path}`;
      },
      header: "Name",
      cell: ({ row }) => {
        const item = row.original;
        const isFolder = isFolderItem(item);
        const name = isFolder
          ? item.name || item.path.split("/").filter(Boolean).pop() || "Folder"
          : item.title ||
            item.path.split("/").filter(Boolean).pop() ||
            "Untitled";
        const href = isFolder ? `/dashboard?path=${item.path}` : item.path;

        return (
          <div className="flex items-center gap-2.5 min-w-0">
            {isFolder ? (
              <Folder className="h-4 w-4 text-blue-400 shrink-0" />
            ) : (
              <FileIcon path={item.path} />
            )}
            <div className="flex flex-col min-w-0">
              {isFolder ? (
                <Link
                  href={href}
                  className="text-sm font-medium truncate leading-tight hover:underline"
                >
                  {name}
                </Link>
              ) : (
                <span className="text-sm font-medium truncate leading-tight flex items-center">
                  {name}
                  {!isFolder && item.locked && (
                    <Lock className="inline ml-1.5 h-3 w-3 opacity-40" />
                  )}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground font-mono truncate leading-tight">
                {item.path}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "mode",
      header: () => <span className="hidden lg:table-cell">Mode</span>,
      cell: ({ row }) => {
        const item = row.original;
        if (isFolderItem(item)) return <div className="hidden lg:table-cell" />;
        return (
          <span className="text-sm text-muted-foreground capitalize hidden lg:table-cell">
            {item.mode}
          </span>
        );
      },
    },
    {
      accessorKey: "visibility",
      header: () => <span className="hidden sm:table-cell">Visibility</span>,
      cell: ({ row }) => {
        const item = row.original;
        if (isFolderItem(item)) return <div className="hidden sm:table-cell" />;
        return (
          <div className="hidden sm:table-cell items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {item.visibility === "public" ? (
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span className="capitalize">{item.visibility}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "views",
      header: () => <span className="hidden md:table-cell">Views</span>,
      cell: ({ row }) => {
        const item = row.original;
        if (isFolderItem(item)) return <div className="hidden md:table-cell" />;
        return (
          <div className="hidden md:table-cell items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 opacity-50" />
              {item.views.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "modified",
      header: () => <span className="hidden sm:table-cell">Modified</span>,
      cell: ({ row }) => {
        const item = row.original;
        if (isFolderItem(item)) return <div className="hidden sm:table-cell" />;
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:table-cell">
            {formatDate(item.modified)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => {
        const item = row.original;
        const isFolder = isFolderItem(item);
        const href = isFolder ? `/dashboard?path=${item.path}` : item.path;

        return (
          <div className="text-right pr-4">
            <DashboardAction isFolder={isFolder} file={item} href={href} />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      searchPlaceholder="Search files and folders..."
    />
  );
}
