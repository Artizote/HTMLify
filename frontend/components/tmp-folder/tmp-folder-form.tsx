"use client";

import Uppy, { Meta, UppyFile } from "@uppy/core";
import XHR from "@uppy/xhr-upload";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UppyDashboardCustom } from "@/components/uppy-dashboard-custom";
import { env } from "@/lib/env";
import {
  AddFileToTmpFolder,
  createTmpFolder,
} from "@/lib/tmp-folder/tmp-folder.api";
import { TmpFolderResponse } from "@/lib/tmp-folder/tmp-folder.types";
import { assignMetaToFiles } from "@/lib/uppy";

interface UploadSuccessResponse {
  id: string;
  name: string;
  url: string;
  expiry: string;
}

const TmpFolderForm = () => {
  const [folderPath, setFolderPath] = useState("");
  const [tmpFolder, setTmpFolder] = useState<TmpFolderResponse | null>(null);
  const [totalUpload, setTotalUpload] = useState({
    success: 0,
    failed: 0,
    total: 0,
  });
  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: { maxNumberOfFiles: 20 },
    }).use(XHR, {
      endpoint: `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-files`,
      fieldName: "file",
      formData: true,
      withCredentials: true,
    }),
  );

  useEffect(() => {
    if (!tmpFolder) return;
    const handleTmpFileUpload = async (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      response: {
        body?: Record<string, never> | undefined;
        status: number;
        bytesUploaded?: number;
        uploadURL?: string;
      },
    ) => {
      const data = response.body as unknown as UploadSuccessResponse;
      const res = await AddFileToTmpFolder({
        tmpFileId: data.id,
        authCode: tmpFolder.auth_code,
        tmpFolderId: tmpFolder.id,
      });
      setTotalUpload((prev) => ({ ...prev, total: prev.total + 1 }));
      if (res) {
        toast.success("File added to tmp folder successfully");
        setTotalUpload((prev) => ({ ...prev, success: prev.success + 1 }));
      } else {
        setTotalUpload((prev) => ({ ...prev, failed: prev.failed + 1 }));
        toast.error("Failed to add file to tmp folder");
      }
    };
    uppy.on("upload-success", handleTmpFileUpload);
    return () => {
      uppy.off("upload-success", handleTmpFileUpload);
    };
  }, [uppy, tmpFolder]);

  useEffect(() => {
    uppy.setOptions({
      onBeforeUpload: (files) => {
        return assignMetaToFiles(files, (file) => ({
          name: file.name,
          expiry: 0,
        }));
      },
    });
  }, [uppy, folderPath]);
  const handleCreateTmpFolder = async () => {
    const data = await createTmpFolder(folderPath);
    if (data) {
      setTmpFolder(data);
      uppy.cancelAll();
      setTotalUpload({ success: 0, failed: 0, total: 0 });
    }
  };
  return (
    <div>
      <Card className="w-full max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>
            Create Tmp Folder Total: {totalUpload.total} Success:{" "}
            {totalUpload.success} Failed: {totalUpload.failed}
          </CardTitle>
          <CardDescription>
            Create a new tmp folder to store your files.
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="flex gap-2 flex-col md:flex-row">
            <Input
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Enter Folder name"
            />
            <Button onClick={handleCreateTmpFolder}>Create</Button>
          </div>
          {tmpFolder && (
            <>
              <div>
                <code className="mt-2 bg-accent-foreground/5 w-full p-2 rounded-md">
                  {env.NEXT_PUBLIC_SITE_URL}/tmp/f/{tmpFolder.id}
                </code>
              </div>
              <div>
                <UppyDashboardCustom uppy={uppy} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TmpFolderForm;
