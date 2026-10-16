import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DeleteAlertDialog } from "@/components/dashboard/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteFile } from "@/lib/modules/file/file.api";
import { FileItem, FolderItem } from "@/lib/modules/file/file.types";
import { pathToPublicUrl } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/actions";

export function DashboardAction({
  file,
}: {
  file: FileItem | FolderItem;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-foreground/50">
          <span className="sr-only">Open menu</span>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <a
              href={pathToPublicUrl(file.path)}
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Public
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              copyToClipboard(pathToPublicUrl(file.path), {
                successMessage: "URL copied",
              })
            }
          >
            Copy URL
          </DropdownMenuItem>
          {file && "id" in file && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/file/edit/${file.id}`}
                  className="w-full cursor-pointer"
                >
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <DeleteAlertDialog
                  title="Delete file"
                  description={`Are you sure you want to delete ${file.path}?`}
                  successMessage="File deleted successfully"
                  onConfirm={async () => {
                    const { error } = await deleteFile(file.id);
                    if (error) {
                      toast.error(error);
                      return false;
                    }
                    return true;
                  }}
                />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
