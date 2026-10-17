"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DeleteAlertDialog } from "@/components/dashboard/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePen } from "@/lib/modules/pen/pen.api";
import { PenResponse } from "@/lib/modules/pen/pen.schema";
import { formatDateTime, pathToPublicUrl } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/actions";

export const columns: ColumnDef<PenResponse>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const pen = row.original;
      return (
        <div className="flex flex-col text-foreground/90 min-w-0">
          <Link
            href={`/dashboard/pens/edit?id=${pen.id}`}
            className="text-sm font-medium truncate leading-tight"
          >
            {pen.title || "Untitled Pen"}
          </Link>
          <span className="text-[11px] text-muted-foreground font-mono truncate leading-tight">
            {`/pen/${pen.id}`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "views",
    header: () => <span className="hidden md:table-cell">Views</span>,
    cell: ({ row }) => {
      const pen = row.original;
      return (
        <div className="hidden md:table-cell">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span className="tabular-nums">{pen.views.toLocaleString()}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "modified",
    header: () => <span className="hidden sm:table-cell">Modified</span>,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums hidden sm:table-cell">
        {formatDateTime(row.getValue("modified"))}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const pen = row.original;

      return (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-foreground/50">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={pathToPublicUrl(`/pen/${pen.id}`)}
                  target="_blank"
                  className="cursor-pointer"
                >
                  View Public
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copyToClipboard(pathToPublicUrl(`/pen/${pen.id}`), {
                    successMessage: "Pen URL copied",
                  })
                }
              >
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/pens/edit?id=${pen.id}`}
                  className="cursor-pointer"
                >
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              >
                <DeleteAlertDialog
                  title="Delete Pen"
                  description={`Are you sure you want to delete "${pen.title}"?`}
                  successMessage="Pen deleted successfully"
                  onConfirm={async () => {
                    const { success, error } = await deletePen(pen.id);
                    if (!success) {
                      toast.error(error || "Failed to delete pen");
                      return false;
                    }
                    return true;
                  }}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

interface PensTableProps {
  pens: PenResponse[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
}

export const PensTable = ({
  pens,
  pageCount,
  pageIndex,
  pageSize,
}: PensTableProps) => {
  const handleRowClick = (pen: PenResponse) => {
    window.location.href = `/dashboard/pens/edit?id=${pen.id}`;
  };

  return (
    <DataTable
      columns={columns}
      data={pens}
      searchPlaceholder="Search by title..."
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onRowClick={handleRowClick}
    />
  );
};
