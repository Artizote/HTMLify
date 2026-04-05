import { EllipsisVertical } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileItem, FolderItem } from "@/lib/modules/file/file.types";

export function DashboardAction({
  isFolder,
  href,
  file,
}: {
  isFolder: boolean;
  href: string;
  file: FileItem | FolderItem;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem>
            {isFolder ? (
              <Link href={href} className="w-full">
                Open
              </Link>
            ) : (
              <a
                href={href}
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>
            )}
          </DropdownMenuItem>
          {file && "id" in file && (
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/file/edit/${file.id}`}
                className="w-full cursor-pointer"
              >
                Edit
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
