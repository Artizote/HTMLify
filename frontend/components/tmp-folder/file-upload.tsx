import { Check, Copy, FolderPlus } from "lucide-react";

import { DropzoneArea } from "@/components/file/dropzone-area";
import { useTmpFolderStore } from "@/lib/hooks/use-tmp-folder";

import { AddFolderForm } from "./add-folder-form";

function FileUpload() {
  const { addFiles, folder, url, copied, copyUrl } = useTmpFolderStore();

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
          {url && (
            <div className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-2">
              <p className="min-w-0 flex-1 select-all truncate font-mono text-xs text-muted-foreground">
                {url}
              </p>
              <button
                type="button"
                onClick={copyUrl}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                title={copied ? "Copied!" : "Copy URL"}
              >
                {copied ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          )}
          <DropzoneArea
            maxFiles={20}
            maxSize={1024 * 1024 * 100}
            onDrop={(files) => addFiles(files)}
          />
        </div>
      )}
    </section>
  );
}

export { FileUpload };
