import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { FileForm } from "@/components/file/file-upload-form";
import {
  getFileContentById,
  getFileInfoByPathOrID,
} from "@/lib/modules/file/file.api";
import { FileIDResponse } from "@/lib/modules/file/file.types";
import { getFileContentType } from "@/lib/modules/file/file.utils";
import { getMe } from "@/lib/modules/user/user.actions";

export default async function NewFileCreatePage({
  params,
}: {
  params: Promise<{ fileID: string }>;
}) {
  const user = await getMe();
  if (!user) {
    return "oh shit 2";
  }

  const { fileID } = await params;

  let fileData: {
    fileInfo: FileIDResponse;
    content: string | undefined;
    mediaUrl: string | null;
  } | null = null;

  const { data, error } = await getFileInfoByPathOrID({ id: Number(fileID) });
  if (error || !data) {
    return error || "Failed to load file";
  }
  const fileContentResp = await getFileContentById(data.id);
  if (!fileContentResp) {
    return "Failed to load file content";
  }
  const content = await fileContentResp.text();
  fileData = { fileInfo: data, content, mediaUrl: fileContentResp.url };

  const contentType = getFileContentType(fileData.fileInfo.path);

  return (
    <>
      <DasshboardNavbar title="Edit File" />
      <div className="w-full max-w-7xl mx-auto pt-10 px-4">
        <FileForm
          mode="update"
          user={user}
          initialData={{
            ...fileData.fileInfo,
            mode:
              fileData.fileInfo.mode === "raw"
                ? "render"
                : fileData.fileInfo.mode,
            content: fileData.content,
            mediaUrl: fileData.mediaUrl,
            fileType: contentType,
          }}
        />
      </div>
    </>
  );
}
