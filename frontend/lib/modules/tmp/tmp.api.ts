import { uploadWithProgress } from "@/lib/fetch/xhr";

import { TmpFile, TmpFormType } from "./tmp.types";

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
