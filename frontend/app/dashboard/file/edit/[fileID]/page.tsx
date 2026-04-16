import { FileForm } from "@/components/file/file-upload-form";
import {
  getFileContentById,
  getFileInfoByPathOrID,
} from "@/lib/modules/file/file.api";
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
    fileInfo: Awaited<ReturnType<typeof getFileInfoByPathOrID>>;
    content: string | undefined;
    mediaUrl: string | null;
  } | null = null;

  try {
    const fileInfo = await getFileInfoByPathOrID({ id: Number(fileID) });
    const fileContentResp = await getFileContentById(fileInfo.id);
    const content = await fileContentResp.text();
    fileData = { fileInfo, content, mediaUrl: fileContentResp.url };
  } catch (err) {
    return err instanceof Error ? err.message : "Failed to load file";
  }

  const contentType = getFileContentType(fileData.fileInfo.path);

  return (
    <div className="w-full max-w-7xl mx-auto pt-10 px-4">
      <FileForm
        mode="update"
        user={user}
        initialData={{
          ...fileData.fileInfo,
          content: fileData.content,
          mediaUrl: fileData.mediaUrl,
          fileType: contentType,
        }}
      />
    </div>
  );
}
