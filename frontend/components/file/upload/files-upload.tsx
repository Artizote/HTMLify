"use client";

import { FolderIcon, FolderPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { DropzoneArea } from "@/components/file/dropzone-area";
import { FileListItem } from "@/components/file/file-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useFileUploadStore } from "@/lib/hooks/use-file-upload";
import { toUserRelativePath } from "@/lib/modules/file/file.utils";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { pathToPublicUrl } from "@/lib/utils";

export const FileUpload = ({
  user,
  initialPath,
}: {
  user: UserFullInfo;
  initialPath?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // `path` is the absolute current folder (from the files page), `dir` is a
  // legacy relative variant kept for backwards compatibility.
  const dirParam = searchParams.get("dir");
  const initialDir = initialPath
    ? toUserRelativePath(initialPath, user.username)
    : dirParam || "";

  const [folderPath, setFolderPath] = useState(
    initialDir
      ? `/${user.username}/${initialDir.replace(/^\//, "")}`
      : `/${user.username}/`,
  );
  // If a folder was passed in (even the user's root), it is already chosen.
  const [folderSet, setFolderSet] = useState(
    Boolean(initialPath) || Boolean(dirParam),
  );
  const [subfolder, setSubfolder] = useState(initialDir);
  const [overwrite, setOverwrite] = useState(false);
  const [mode, setMode] = useState<"source" | "render">("render");
  const [visibility, setVisibility] = useState<"public" | "hidden">("public");
  const { queue, addFiles, removeItem, retryItem, retryFailed, clearQueue } =
    useFileUploadStore();

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
          onDrop={(files) => addFiles(files, folderPath, overwrite, mode, visibility)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="accent-primary"
            />
            Overwrite existing files
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-xs font-medium">Private</span>
              <Switch
                size="sm"
                checked={visibility === "public"}
                onCheckedChange={(v) =>
                  setVisibility(v ? "public" : "hidden")
                }
              />
              <span className="text-xs font-medium">Public</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-xs font-medium">Source</span>
              <Switch
                size="sm"
                checked={mode === "render"}
                onCheckedChange={(v) => setMode(v ? "render" : "source")}
              />
              <span className="text-xs font-medium">Render</span>
            </label>
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="border-t border-border/40">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground">Uploads</p>
            {queue.some((item) => item.status === "failed") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => retryFailed(overwrite)}
              >
                Retry All
              </Button>
            )}
          </div>
          <div className="flex flex-col">
            {queue
              .filter((item) => item.status === "completed")
              .map((item) => {
                const folder = item.path.split("/").slice(0, -1).join("/");
                return (
                  <FileListItem
                    key={item.localId}
                    name={item.file.name}
                    size={item.file.size}
                    progress={item.progress}
                    onFolder={() =>
                      router.push(`/dashboard/files?path=${folder}`)
                    }
                    onOpen={() =>
                      window.open(pathToPublicUrl(item.path), "_blank")
                    }
                  />
                );
              })}
            {queue
              .filter((item) => item.status !== "completed")
              .map((item) => (
                <div key={item.localId}>
                  <FileListItem
                    key={item.localId}
                    name={item.file.name}
                    size={item.file.size}
                    progress={item.progress}
                    error={
                      item.status === "failed" ? item.error : undefined
                    }
                    onRetry={
                      item.status === "failed"
                        ? () => retryItem(item.localId, overwrite)
                        : undefined
                    }
                    onRemove={() => removeItem(item.localId)}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
