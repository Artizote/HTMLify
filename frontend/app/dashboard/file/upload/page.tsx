import { redirect } from "next/navigation";

import { DasshboardNavbar } from "@/components/dashboard/dashbaord-navbar";
import { FileUpload } from "@/components/file/upload/files-upload";
import { PageShell } from "@/components/page-shell";
import { getMe } from "@/lib/modules/user/user.actions";

const UploadPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) => {
  const user = await getMe();
  if (!user) {
    redirect("/");
  }
  const { path } = await searchParams;
  return (
    <>
      <DasshboardNavbar title="Upload Files" />
      <PageShell
        title="Upload Files"
        description="Drag and drop files to upload them to your workspace."
        className="mb-52"
      >
        <FileUpload user={user} initialPath={path} />
      </PageShell>
    </>
  );
};

export default UploadPage;
