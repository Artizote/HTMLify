import { redirect } from "next/navigation";

import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { FileUpload } from "@/components/file/upload/files-upload";
import { PageShell } from "@/components/page-shell";
import { getMe } from "@/lib/modules/user/user.actions";

const UploadPage = async () => {
  const user = await getMe();
  if (!user) {
    redirect("/");
  }
  return (
    <>
      <DasshboardNavbar title="Upload Files" />
      <PageShell
        title="Upload Files"
        description="Drag and drop files to upload them to your workspace."
        className="mb-52"
      >
        <FileUpload user={user} />
      </PageShell>
    </>
  );
};

export default UploadPage;
