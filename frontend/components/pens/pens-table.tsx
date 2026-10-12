"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
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
import { copyToClipboard } from "@/lib/utils/actions";

export const columns: ColumnDef<PenResponse>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const pen = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/dashboard/pens/edit?id=${pen.id}`}
            className="font-medium hover:underline decoration-primary/50 underline-offset-4 transition-all"
          >
            {pen.title || "Untitled Pen"}
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">
            {pen.id}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="w-3.5 h-3.5" />
          <span className="text-sm tabular-nums">{row.getValue("views")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "modified",
    header: "Last Modified",
    cell: ({ row }) => {
      const date = new Date(row.getValue("modified"));
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(date)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const pen = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  if (await copyToClipboard(pen.id)) {
                    toast.success("Pen ID copied");
                  }
                }}
              >
                Copy Pen ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/pens/edit?id=${pen.id}`}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Pen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/pen/${pen.id}`}
                  target="_blank"
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Public
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
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Your Pens</h2>
        <p className="text-muted-foreground">
          Manage your HTML/CSS/JS playgrounds and snippets.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={pens}
        searchPlaceholder="Search by title..."
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
    </div>
  );
};
