import { FileListItem } from "@/components/file/file-list-item";
import { useTmpFolderStore } from "@/lib/hooks/use-tmp-folder";

function ListFiles() {
  const { queue, folder, deleteFile } = useTmpFolderStore();

  if (!folder) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col">
        {folder.files.map((fileId) => (
          <FileListItem
            key={fileId}
            name={fileId}
            size={0}
            progress={100}
            onRemove={(e) => {
              e.preventDefault();
              deleteFile(fileId);
            }}
          />
        ))}
        {queue.toReversed().map((item) => (
          <FileListItem
            key={item.id}
            name={item.file.name}
            size={item.file.size}
            progress={item.progress}
            onRemove={(e) => {
              e.preventDefault();
              deleteFile(item.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { ListFiles };
