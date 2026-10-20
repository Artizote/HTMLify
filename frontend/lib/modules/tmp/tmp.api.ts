import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { uploadWithProgress } from "@/lib/fetch/xhr";

import { TmpFile, TmpFormType } from "./tmp.types";

export const MAX_TEXT_PREVIEW_SIZE = 400_000;

interface CreateTmpFileOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export const createTmpFile = async (
  data: TmpFormType,
  options?: CreateTmpFileOptions,
): Promise<{ data: TmpFile | null; error: string | null }> => {
  const formData = new FormData();
  if (data.file) {
    formData.append("file", data.file);
  }
  if (data.name) {
    formData.append("name", data.name);
  }
  if (data.expiry !== undefined) {
    formData.append("expiry", data.expiry.toString());
  }

  const result = await uploadWithProgress(
    "POST",
    `/api/v1/tmp-files`,
    formData,
    options?.onProgress,
    options?.signal,
  );

  if (!result) {
    return { data: null, error: "Failed to upload temporary file" };
  }

  if (result.status >= 200 && result.status < 300) {
    try {
      return {
        data: JSON.parse(result.responseText) as TmpFile,
        error: null,
      };
    } catch {
      return { data: null, error: "Invalid response from server" };
    }
  }

  return { data: null, error: "Failed to upload temporary file" };
};

export const getTmpFileText = async (
  id: string,
): Promise<{ data: string | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-files/${id}/content`,
  );

  if (error || !response) {
    return { data: null, error: error || "Failed to load file content" };
  }

  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_TEXT_PREVIEW_SIZE) {
    return { data: null, error: "file is too large to preview" };
  }

  return { data: await response.text(), error: null };
};
