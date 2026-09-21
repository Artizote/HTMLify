import { create } from "zustand";

import {
  deleteFile,
  uploadFileWithProgress,
} from "@/lib/modules/file/file.api";
import { FileIDResponse } from "@/lib/modules/file/file.types";

type UploadStatus = "queued" | "uploading" | "completed" | "failed";

interface UploadItem {
  localId: string;
  id?: number;
  file: File;
  path: string;
  progress: number;
  status: UploadStatus;
  response?: FileIDResponse;
}

interface FileUploadStore {
  queue: UploadItem[];
  isUploading: boolean;

  deleteFile: (localId: string) => void;

  addFiles: (files: File[], folderPath: string) => void;
  startQueue: () => Promise<void>;
  updateProgress: (localId: string, progress: number) => void;
  updateItem: (localId: string, updates: Partial<UploadItem>) => void;
  clearQueue: () => void;
}

export const useFileUploadStore = create<FileUploadStore>((set, get) => ({
  queue: [],
  isUploading: false,

  deleteFile: async (localId) => {
    const item = get().queue.find((i) => i.localId === localId);
    if (!item) return;

    if (item.id) {
      const { error } = await deleteFile(item.id);
      if (error) return;
    }

    set((state) => ({
      queue: state.queue.filter((i) => i.localId !== localId),
    }));
  },

  addFiles: (files, folderPath) => {
    const newItems: UploadItem[] = files.map((file) => {
      const fullPath = folderPath
        ? `${folderPath.replace(/\/$/, "")}/${file.name}`
        : file.name;
      return {
        localId: crypto.randomUUID(),
        file,
        path: fullPath,
        progress: 0,
        status: "queued" as const,
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
              ? { ...item, status: "uploading" as const }
              : item,
          ),
        }));

        try {
          const formData = new FormData();
          formData.append("file", next.file);
          formData.append("path", next.path);
          formData.append("visibility", "public");
          formData.append("mode", "source");

          const { data, error } = await uploadFileWithProgress(formData, {
            onProgress: (progress) => {
              get().updateProgress(next.localId, progress);
            },
          });

          if (error || !data) {
            throw new Error(error || "Upload failed");
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
          const message = err instanceof Error ? err.message : "Upload failed";
          set((state) => ({
            queue: state.queue.map((item) =>
              item.localId === next.localId
                ? { ...item, status: "failed" as const }
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

  clearQueue: () => set({ queue: [] }),
}));
