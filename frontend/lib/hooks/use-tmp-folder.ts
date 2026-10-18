import { create } from "zustand";

import { env } from "@/lib/env";
import { createTmpFile } from "@/lib/modules/tmp/tmp.api";
import { TmpFile } from "@/lib/modules/tmp/tmp.types";
import {
  AddFileToTmpFolder,
  createTmpFolder,
  DeleteTmpFileFromFolder,
} from "@/lib/tmp-folder/tmp-folder.api";
import { randomId } from "@/lib/utils";

import { TmpFolderResponse } from "../tmp-folder/tmp-folder.types";

type UploadStatus = "queued" | "uploading" | "completed" | "failed";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  controller?: AbortController;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
}

interface TmpFolderStore {
  folder: TmpFolderResponse | null;
  setFolder: (name: string, folderId?: string) => void;

  createFolder: (
    name: string,
  ) => Promise<{ success: boolean; error: string | null }>;
  deleteFile: (fileId: string) => Promise<void>;
  resetFolder: () => void;

  queue: UploadItem[];
  isUploading: boolean;

  cancelled: string[];
  uploaded: UploadedFile[];
  removeFromQueue: (id: string) => void;

  url: string | null;
  focusName: boolean;

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
      uploaded: state.uploaded.filter((file) => file.id !== fileId),
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
      uploaded: [],
      cancelled: [],
      focusName: false,
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
        uploaded: [],
        cancelled: [],
        focusName: false,
      });
      return { success: true, error: null };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Failed to create folder" };
    }
  },

  resetFolder: () => {
    const { queue } = get();
    queue.forEach((item) => item.controller?.abort());
    set({
      folder: null,
      queue: [],
      uploaded: [],
      cancelled: queue.map((item) => item.id),
      url: null,
      focusName: true,
    });
  },

  queue: [],
  isUploading: false,

  cancelled: [],
  uploaded: [],
  removeFromQueue: (id) => {
    get().queue.find((item) => item.id === id)?.controller?.abort();
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
      cancelled: [...state.cancelled, id],
    }));
  },

  url: null,
  focusName: false,

  addFiles: (files) => {
    set((state) => ({
      queue: [
        ...state.queue,
        ...files.map((file) => ({
          id: randomId(),
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
            item.id === next.id
              ? {
                  ...item,
                  status: "uploading" as const,
                  controller: new AbortController(),
                }
              : item,
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
            });
          }

          if (!folder?.auth_code) {
            throw new Error("Auth code is required");
          }

          const tmpFile = await uploadFile(
            next,
            folderId,
            folder?.auth_code,
            (progress) => {
              get().updateProgress(next.id, progress);
            },
            get().queue.find((item) => item.id === next.id)?.controller
              ?.signal,
          );

          if (get().cancelled.includes(next.id)) {
            const { folder: current } = get();
            if (current?.auth_code) {
              await DeleteTmpFileFromFolder({
                tmpFolderId: folderId,
                tmpFileId: tmpFile.id,
                authCode: current.auth_code,
              }).catch(() => {});
            }
            continue;
          }

          set((state) => ({
            uploaded: [
              ...state.uploaded,
              {
                id: tmpFile.id,
                name: tmpFile.name,
                size: next.file.size,
                url: tmpFile.url,
              },
            ],
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
          if (get().cancelled.includes(next.id)) {
            continue;
          }
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
  signal?: AbortSignal,
): Promise<TmpFile> => {
  const { data: tmpFile, error: uploadError } = await createTmpFile(
    { file: item.file },
    { onProgress, signal },
  );
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

  return tmpFile;
};
