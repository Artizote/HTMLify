type FileVisibility = "public" | "private" | "once";
export type FileMode = "source" | "render" | "raw";
type FileType = "img" | "video" | "audio" | "binary" | "other";

type FileIDResponse = {
  id: number;
  user: string;
  title: string;
  path: string;
  views: number;
  blob_hash: string;
  mode: FileMode;
  visibility: FileVisibility;
  password: string | null;
  locked: boolean;
  as_guest: boolean;
  modified: string;
  content: string | null;
};

type FileItem = {
  id: number;
  user: string;
  title: string;
  path: string;
  views: number;
  blob_hash: string | null;
  mode: FileMode;
  visibility: FileVisibility;
  password: string | null;
  locked: boolean;
  as_guest: boolean;
  modified: string;
  content: string | null;
};

type FolderItem = {
  name: string;
  path: string;
  items: (FileItem | FolderItem)[];
};

type FolderResponse = {
  name: string;
  path: string;
  items: (FileItem | FolderItem)[];
  items_count: number;
};

function isFolderItem(item: FileItem | FolderItem): item is FolderItem {
  return "name" in item;
}

export type { FileIDResponse, FileItem, FileType, FolderItem, FolderResponse };
export { isFolderItem };
