"use client";

import Uppy, { Meta, UppyFile } from "@uppy/core";
import XHR from "@uppy/xhr-upload";
import { FolderIcon, UploadCloudIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UppyDashboardCustom } from "@/components/uppy-dashboard-custom";
import { env } from "@/lib/env";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { assignMetaToFiles, checkUserSession } from "@/lib/uppy";

export const FileUpload = ({ user }: { user: UserFullInfo }) => {
  const [folderPath, setFolderPath] = useState(`/${user.username}/`);
  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: { maxNumberOfFiles: 20 },
    }).use(XHR, {
      endpoint: `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/upload`,
      fieldName: "file",
      formData: true,
      withCredentials: true,
    }),
  );
  useEffect(() => {
    const handleUploadError = (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      error: { name: string; message: string; details?: string },
      response?: Omit<
        {
          body?: Record<string, never>;
          status: number;
          bytesUploaded?: number;
          uploadURL?: string;
        },
        "uploadURL"
      >,
    ) => {
      let serverMessage = error.message ?? "Upload failed";
      try {
        const body = JSON.parse(
          (response as unknown as { response: string })?.response ??
            (response as unknown as { responseText: string })?.responseText ??
            "{}",
        );
        serverMessage = body?.detail ?? serverMessage;
      } catch {}

      toast.error(`${file?.name} : ${serverMessage}`);
    };

    const handleRestriction = (_file: unknown, error: Error) => {
      toast.error(error.message);
    };

    uppy.on("upload-error", handleUploadError);
    uppy.on("restriction-failed", handleRestriction);

    return () => {
      uppy.off("upload-error", handleUploadError);
      uppy.off("restriction-failed", handleRestriction);
    };
  }, [uppy]);

  useEffect(() => {
    uppy.setOptions({
      onBeforeUpload: (files) => {
        checkUserSession();
        return assignMetaToFiles(files, (file) => {
          const fullPath = folderPath
            ? `${folderPath.replace(/\/$/, "")}/${file.name}`
            : file.name;
          return {
            path: fullPath,
            visibility: "public",
            mode: "source",
          };
        });
      },
    });
  }, [uppy, folderPath]);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-10 w-full animate-in fade-in duration-500">
      <Card className="w-full max-w-4xl border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UploadCloudIcon className="w-6 h-6" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              File Uploader
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Drag and drop files to upload them to your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 flex flex-col gap-8">
          <div className="grid gap-4 p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
            <div className="flex items-center gap-2 text-foreground/80">
              <FolderIcon className="w-4 h-4" />
              <Label htmlFor="folder-path" className="font-semibold">
                Destination Folder
              </Label>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                id="folder-path"
                type="text"
                placeholder="e.g. documents/project-alpha"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                className="h-11 bg-background/50 border-border/60 focus-visible:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground ml-1">
                Make sure the folders name starts with{" "}
                <code className="bg-muted px-1 py-0.5 rounded">{`/${user.username}/`}</code>
              </p>
            </div>
          </div>

          <UppyDashboardCustom uppy={uppy} />
        </CardContent>
      </Card>
    </div>
  );
};
