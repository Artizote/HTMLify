"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Folder, Lock } from "lucide-react";
import Link from "next/link";

import { DashboardAction } from "@/components/dashboard/dashboard-action";
import { DataTable } from "@/components/ui/data-table";
import {
  FileItem,
  FolderItem,
  isFolderItem,
} from "@/lib/modules/file/file.types";
import { formatDateTime } from "@/lib/utils";

import { FileIcon } from "./file-icon";

interface Props {
  items: (FileItem | FolderItem)[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

export function FileTable({ items, totalItems, currentPage, pageSize }: Props) {
  const handleRowClick = (item: FileItem | FolderItem) => {
    if (isFolderItem(item)) {
      window.location.href = `/dashboard/files?path=${item.path}`;
    } else {
      window.location.href = `/dashboard/file/edit/${item.id}`;
    }
  };

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
        const href = isFolder
          ? `/dashboard/files?path=${item.path}`
          : `/dashboard/file/edit/${item.id}`;

        return (
          <div className="flex items-center gap-2.5 min-w-0">
            {isFolder ? (
              <Folder
                fill="currentColor"
                className="h-4 w-4 text-blue-400 shrink-0"
              />
            ) : (
              <FileIcon path={item.path} />
            )}
            <div className="flex flex-col text-foreground/90 min-w-0">
              <Link
                href={href}
                className="text-sm font-medium truncate leading-tight"
              >
                {name}
                {!isFolder && item.locked && (
                  <Lock className="inline ml-1.5 h-3 w-3 opacity-40" />
                )}
              </Link>
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
          <span className="text-sm text-foreground/80 capitalize hidden lg:table-cell">
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
          <div className="hidden sm:table-cell items-center gap-1.5 text-sm ">
            <span className="capitalize text-foreground/80">
              {item.visibility}
            </span>
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
          <div className="hidden md:table-cell">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span className="tabular-nums">
                {item.views.toLocaleString()}
              </span>
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
          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums hidden sm:table-cell">
            {formatDateTime(item.modified)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="text-right ">
            <div onClick={(e) => e.stopPropagation()}>
              <DashboardAction file={item} />
            </div>
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
      pageCount={Math.ceil(totalItems / pageSize)}
      pageIndex={currentPage - 1}
      pageSize={pageSize}
      onRowClick={handleRowClick}
    />
  );
}
