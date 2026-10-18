import { create } from "zustand";

import {
  deleteFile,
  getFileInfoByPathOrID,
  uploadFileWithProgress,
} from "@/lib/modules/file/file.api";
import { FileIDResponse } from "@/lib/modules/file/file.types";
import { randomId } from "@/lib/utils";

type UploadStatus = "queued" | "uploading" | "completed" | "failed";

interface UploadItem {
  localId: string;
  id?: number;
  file: File;
  path: string;
  progress: number;
  status: UploadStatus;
  response?: FileIDResponse;
  controller?: AbortController;
  error?: string;
  overwrite?: boolean;
}

interface FileUploadStore {
  queue: UploadItem[];
  isUploading: boolean;
  cancelled: string[];

  removeItem: (localId: string) => void;

  addFiles: (files: File[], folderPath: string, overwrite?: boolean) => void;
  startQueue: () => Promise<void>;
  updateProgress: (localId: string, progress: number) => void;
  updateItem: (localId: string, updates: Partial<UploadItem>) => void;
  retryItem: (localId: string, overwrite?: boolean) => void;
  retryFailed: (overwrite?: boolean) => void;
  clearQueue: () => void;
}

export const useFileUploadStore = create<FileUploadStore>((set, get) => ({
  queue: [],
  isUploading: false,
  cancelled: [],

  removeItem: (localId) => {
    const item = get().queue.find((i) => i.localId === localId);
    if (!item) return;

    item.controller?.abort();
    set((state) => ({
      queue: state.queue.filter((i) => i.localId !== localId),
      cancelled: [...state.cancelled, localId],
    }));
  },

  addFiles: (files, folderPath, overwrite = false) => {
    const newItems: UploadItem[] = files.map((file) => {
      const fullPath = folderPath
        ? `${folderPath.replace(/\/$/, "")}/${file.name}`
        : file.name;
      return {
        localId: randomId(),
        file,
        path: fullPath,
        progress: 0,
        status: "queued" as const,
        overwrite,
      };
    });

    set((state) => ({
      queue: [...state.queue, ...newItems],
    }));

    void get().startQueue();
  },

  startQueue: async () => {
    if (get().isUploading) return;
    set({ isUploading: true });

    try {
      while (true) {
        const { queue } = get();
        const next = queue.find((item) => item.status === "queued");
        if (!next) break;

        set((state) => ({
          queue: state.queue.map((item) =>
            item.localId === next.localId
              ? {
                  ...item,
                  status: "uploading" as const,
                  controller: new AbortController(),
                }
              : item,
          ),
        }));

        try {
          // No upload try if the path already taken
          if (!next.overwrite) {
            const { data: existing } = await getFileInfoByPathOrID({
              path: next.path,
            });
            if (existing) {
              set((state) => ({
                queue: state.queue.map((item) =>
                  item.localId === next.localId
                    ? {
                        ...item,
                        status: "failed" as const,
                        error: "File on this path already exists",
                      }
                    : item,
                ),
              }));
              continue;
            }
          }

          const formData = new FormData();
          formData.append("file", next.file);
          formData.append("path", next.path);
          formData.append("visibility", "public");
          formData.append("mode", "source");
          if (next.overwrite) {
            formData.append("update", "true");
          }

          const { data, error } = await uploadFileWithProgress(formData, {
            onProgress: (progress) => {
              get().updateProgress(next.localId, progress);
            },
            signal: get().queue.find((item) => item.localId === next.localId)
              ?.controller?.signal,
          });

          if (error || !data) {
            if (get().cancelled.includes(next.localId)) continue;
            throw new Error(error || "Upload failed");
          }

          if (get().cancelled.includes(next.localId)) {
            void deleteFile(data.id);
            continue;
          }

          set((state) => ({
            queue: state.queue.map((item) =>
              item.localId === next.localId
                ? {
                    ...item,
                    id: data.id,
                    status: "completed",
                    progress: 100,
                    response: data,
                  }
                : item,
            ),
          }));
        } catch (err) {
          if (get().cancelled.includes(next.localId)) continue;
          const message = err instanceof Error ? err.message : "Upload failed";
          set((state) => ({
            queue: state.queue.map((item) =>
              item.localId === next.localId
                ? {
                    ...item,
                    status: "failed" as const,
                    error: message,
                  }
                : item,
            ),
          }));
          console.error(`${next.file.name}: ${message}`);
        }
      }
    } finally {
      set({ isUploading: false });
    }
  },

  updateProgress: (localId, progress) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.localId === localId ? { ...item, progress } : item,
      ),
    })),

  updateItem: (localId, updates) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.localId === localId ? { ...item, ...updates } : item,
      ),
    })),

  retryItem: (localId, overwrite = false) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.localId === localId
          ? {
              ...item,
              status: "queued" as const,
              progress: 0,
              error: undefined,
              overwrite,
            }
          : item,
      ),
    }));
    void get().startQueue();
  },

  retryFailed: (overwrite = false) => {
    const hasFailed = get().queue.some((item) => item.status === "failed");
    if (!hasFailed) return;
    set((state) => ({
      queue: state.queue.map((item) =>
        item.status === "failed"
          ? {
              ...item,
              status: "queued" as const,
              progress: 0,
              error: undefined,
              overwrite,
            }
          : item,
      ),
    }));
    void get().startQueue();
  },

  clearQueue: () => {
    const { queue } = get();
    queue.forEach((item) => item.controller?.abort());
    set({
      queue: [],
      cancelled: [
        ...get().cancelled,
        ...queue.map((item) => item.localId),
      ],
    });
  },
}));
