import { FolderPlus } from "lucide-react";

import { DropzoneArea } from "@/components/file/dropzone-area";
import { CopyableUrl } from "@/components/ui/copyable-url";
import { useTmpFolderStore } from "@/lib/hooks/use-tmp-folder";

import { AddFolderForm } from "./add-folder-form";

function FileUpload() {
  const { addFiles, folder, url } = useTmpFolderStore();

  return (
    <section>
      {!folder?.name ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 py-12 text-center">
          <FolderPlus className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Make a folder to upload files
          </p>
          <AddFolderForm />
        </div>
      ) : (
        <div className="space-y-3">
          {url && <CopyableUrl url={url} showShare showOpen />}
          <DropzoneArea
            maxFiles={20}
            onDrop={(files) => addFiles(files)}
          />
        </div>
      )}
    </section>
  );
}

export { FileUpload };