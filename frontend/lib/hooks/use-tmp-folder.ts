import { create } from "zustand";

import { env } from "@/lib/env";
import { createTmpFile } from "@/lib/modules/tmp/tmp.api";
import {
  AddFileToTmpFolder,
  createTmpFolder,
  DeleteTmpFileFromFolder,
} from "@/lib/tmp-folder/tmp-folder.api";

import { TmpFolderResponse } from "../tmp-folder/tmp-folder.types";

type UploadStatus = "queued" | "uploading" | "completed" | "failed";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
}

interface TmpFolderStore {
  folder: TmpFolderResponse | null;
  setFolder: (name: string, folderId?: string) => void;

  createFolder: (
    name: string,
  ) => Promise<{ success: boolean; error: string | null }>;
  deleteFile: (fileId: string) => Promise<void>;

  queue: UploadItem[];
  isUploading: boolean;

  url: string | null;
  copied: boolean;
  copyUrl: () => void;
  resetCopy: () => void;

  addFiles: (files: File[]) => void;
  startQueue: () => Promise<void>;
  updateProgress: (id: string, progress: number) => void;
}

export const useTmpFolderStore = create<TmpFolderStore>((set, get) => ({
  folder: null,

  deleteFile: async (fileId: string) => {
    const { folder } = get();
    if (!folder?.id || !folder?.auth_code) return;

    const { error } = await DeleteTmpFileFromFolder({
      tmpFolderId: folder.id,
      tmpFileId: fileId,
      authCode: folder.auth_code,
    });

    if (error) return;

    set((state) => ({
      folder: state.folder
        ? {
            ...state.folder,
            files: state.folder.files.filter((id) => id !== fileId),
          }
        : null,
    }));
  },
  setFolder: (folderName, folderId = "", authCode = "") =>
    set({
      folder: {
        id: folderId,
        files: [],
        name: folderName,
        auth_code: authCode,
      },
      url: folderId ? `${env.NEXT_PUBLIC_SITE_URL}/tmp/f/${folderId}` : null,
      copied: false,
    }),

  createFolder: async (name: string) => {
    try {
      const { data, error } = await createTmpFolder(name);
      if (error || !data) {
        return { success: false, error: error ?? "Failed to create folder" };
      }
      set({
        folder: data,
        url: `${env.NEXT_PUBLIC_SITE_URL}/tmp/f/${data.id}`,
        copied: false,
      });
      return { success: true, error: null };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Failed to create folder" };
    }
  },

  queue: [],
  isUploading: false,

  url: null,
  copied: false,

  copyUrl: () => {
    const { folder } = get();
    if (!folder?.id) return;
    const url = `${env.NEXT_PUBLIC_SITE_URL}/tmp/f/${folder.id}`;
    navigator.clipboard.writeText(url).then(() => {
      set({ copied: true });
      setTimeout(() => set({ copied: false }), 1800);
    });
  },

  resetCopy: () => set({ copied: false }),

  addFiles: (files) => {
    set((state) => ({
      queue: [
        ...state.queue,
        ...files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "queued" as const,
        })),
      ],
    }));

    void get().startQueue();
  },

  startQueue: async () => {
    if (get().isUploading) return;

    set({ isUploading: true });

    try {
      while (true) {
        const { queue, folder } = get();

        const next = queue.find((item) => item.status === "queued");
        if (!next) break;

        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === next.id ? { ...item, status: "uploading" } : item,
          ),
        }));

        try {
          let folderId = folder?.id;

          if (!folderId) {
            if (!folder?.name) {
              throw new Error("Folder name is required");
            }

            const { data, error } = await createTmpFolder(folder.name);

            if (error || !data) {
              throw new Error(error ?? "Failed to create folder");
            }

            folderId = data.id;

            set({
              folder: data,
              url: `${env.NEXT_PUBLIC_SITE_URL}/tmp/f/${data.id}`,
              copied: false,
            });
          }

          if (!folder?.auth_code) {
            throw new Error("Auth code is required");
          }

          await uploadFile(next, folderId, folder?.auth_code, (progress) => {
            get().updateProgress(next.id, progress);
          });

          set((state) => ({
            queue: state.queue.map((item) =>
              item.id === next.id
                ? {
                    ...item,
                    status: "completed",
                    progress: 100,
                  }
                : item,
            ),
          }));
        } catch (err) {
          console.error(err);

          set((state) => ({
            queue: state.queue.map((item) =>
              item.id === next.id
                ? {
                    ...item,
                    status: "failed",
                  }
                : item,
            ),
          }));
        }
      }
    } finally {
      set({ isUploading: false });
    }
  },

  updateProgress: (id, progress) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, progress } : item,
      ),
    })),
}));

const uploadFile = async (
  item: UploadItem,
  folderId: string,
  authCode: string,
  onProgress: (progress: number) => void,
) => {
  const { data: tmpFile, error: uploadError } = await createTmpFile(
    { file: item.file },
    { onProgress },
  );
  console.log({ tmpFile });
  if (uploadError || !tmpFile) {
    throw new Error(uploadError ?? "Failed to upload file");
  }

  const { error: addError } = await AddFileToTmpFolder({
    tmpFolderId: folderId,
    tmpFileId: tmpFile.id,
    authCode,
  });
  if (addError) {
    throw new Error(addError);
  }
};
