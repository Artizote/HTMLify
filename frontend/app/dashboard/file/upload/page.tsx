import { redirect } from "next/navigation";

import { FileUpload } from "@/components/file/upload/files-upload";
import { getMe } from "@/lib/modules/user/user.actions";

const UploadPage = async () => {
  const user = await getMe();
  if (!user) {
    redirect("/");
  }
  return <FileUpload user={user} />;
};

export default UploadPage;
