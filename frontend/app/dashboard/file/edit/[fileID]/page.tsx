import { FileForm } from "@/components/file/form";
import { getFileContentById, getFileInfoByPathOrID } from "@/lib/modules/file/file.actions";
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
  const fileInfo = await getFileInfoByPathOrID({ id: Number(fileID) });
  if (!fileInfo) {
    return "no file found";
  }
  const fileContentResp = await getFileContentById(fileInfo.id);
  const content = await fileContentResp?.text();
  return (
    <div className="container mx-auto pt-10 px-4">
      <FileForm user={user} initialData={{ ...fileInfo, content }} />
    </div>
  );
}
