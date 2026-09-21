"use client";

import { FolderIcon, FolderPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { DropzoneArea } from "@/components/file/dropzone-area";
import { FileListItem } from "@/components/file/file-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFileUploadStore } from "@/lib/hooks/use-file-upload";
import { UserFullInfo } from "@/lib/modules/user/user.types";

export const FileUpload = ({ user }: { user: UserFullInfo }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dirParam = searchParams.get("dir");

  const [folderPath, setFolderPath] = useState(
    dirParam
      ? `/${user.username}/${dirParam.replace(/^\//, "")}`
      : `/${user.username}/`,
  );
  const [folderSet, setFolderSet] = useState(!!dirParam);
  const [subfolder, setSubfolder] = useState(dirParam || "");
  const { queue, addFiles, deleteFile, clearQueue } = useFileUploadStore();

  const updateUrlParams = (path: string) => {
    const params = new URLSearchParams(window.location.search);
    const subPath = path.replace(`/${user.username}/`, "");
    if (subPath) {
      params.set("dir", subPath);
    } else {
      params.delete("dir");
    }

    clearQueue();
    router.replace(`?${params.toString()}`);
  };

  const handleSetFolder = () => {
    let newPath: string;
    if (subfolder.trim()) {
      newPath = `/${user.username}/${subfolder.replace(/^\//, "")}`;
    } else {
      newPath = `/${user.username}/`;
    }
    setFolderPath(newPath);
    setFolderSet(true);
    updateUrlParams(newPath);
  };

  if (!folderSet) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 py-12 text-center">
        <FolderPlus className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Set a destination folder to start uploading
        </p>
        <div className="flex w-full max-w-md items-center gap-2 px-4">
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            /{user.username}/
          </span>
          <Input
            type="text"
            placeholder="subfolder/path (optional)"
            value={subfolder}
            onChange={(e) => setSubfolder(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetFolder()}
            className="h-9 flex-1"
          />
          <Button onClick={handleSetFolder} size="sm">
            Set
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
        <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {folderPath}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFolderSet(false)}
          className="ml-auto h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          Change
        </Button>
      </div>
      <div className="p-4">
        <DropzoneArea
          maxFiles={20}
          onDrop={(files) => addFiles(files, folderPath)}
        />
      </div>

      {queue.length > 0 && (
        <div className="border-t border-border/40">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground">Uploads</p>
          </div>
          <div className="flex flex-col">
            {[...queue].reverse().map((item) => (
              <FileListItem
                onRemove={() => deleteFile(item.localId)}
                key={item.localId}
                name={item.file.name}
                size={item.file.size}
                progress={item.progress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
