import { FileListItem } from "@/components/file/file-list-item";
import { Separator } from "@/components/ui/separator";
import { useTmpFolderStore } from "@/lib/hooks/use-tmp-folder";

function UploadList() {
  const { queue, uploaded, folder, deleteFile, removeFromQueue } =
    useTmpFolderStore();

  if (!folder) {
    return null;
  }

  const pendingQueue = queue.filter((item) => item.status !== "completed");
  const hasItems = uploaded.length > 0 || pendingQueue.length > 0;

  if (!hasItems) {
    return (
      <p className="text-center py-2 text-sm text-muted-foreground">
        Folder is empty, upload files.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex flex-col">
        {uploaded.map((file) => (
          <FileListItem
            key={file.id}
            name={file.name}
            size={file.size}
            subtitle={file.id}
            progress={100}
            onOpen={(e) => {
              e.preventDefault();
              if (file.url) {
                window.open(file.url, "_blank", "noopener,noreferrer");
              }
            }}
            onRemove={(e) => {
              e.preventDefault();
              deleteFile(file.id);
            }}
          />
        ))}
        {pendingQueue.map((item) => (
          <FileListItem
            key={item.id}
            name={item.file.name}
            size={item.file.size}
            progress={item.progress}
            onRemove={(e) => {
              e.preventDefault();
              removeFromQueue(item.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { UploadList };
