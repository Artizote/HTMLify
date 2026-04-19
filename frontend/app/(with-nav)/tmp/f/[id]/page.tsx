import React from "react";

import { getTmpFolderFiles } from "@/lib/tmp-folder/tmp-folder.api";

const TmpFolderPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const files = await getTmpFolderFiles(id);
  if (!files) {
    return <div>Tmp folder not found</div>;
  }
  return (
    <div className="flex flex-col gap-4">
      total {files.length} files
      {files.map((file) => (
        <div key={file.id}>
          <a href={file.url}>
            this : {file.name}
            {file.expiry}
          </a>
        </div>
      ))}
    </div>
  );
};

export default TmpFolderPage;
