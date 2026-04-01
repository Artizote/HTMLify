import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { FileItem, FolderItem } from "@/shared/types";

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
            <DropdownMenuItem>
              <Link href={`/dashboard/file/edit/${file.id}`}>Edit</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
