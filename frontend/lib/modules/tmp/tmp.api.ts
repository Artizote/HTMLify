import { env } from "@/lib/env";

import { TmpFile, TmpFormType } from "./tmp.types";

interface CreateTmpFileOptions {
  onProgress?: (progress: number) => void;
}

export const createTmpFile = async (
  data: TmpFormType,
  options?: CreateTmpFileOptions,
): Promise<{ data: TmpFile | null; error: string | null }> => {
  const formData = new FormData();
  if (data.file) {
    console.log({ file: typeof data.file });
    formData.append("file", data.file);
  }
  if (data.name) {
    formData.append("name", data.name);
  }
  if (data.expiry !== undefined) {
    formData.append("expiry", data.expiry.toString());
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/v1/tmp-files`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options?.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({
            data: JSON.parse(xhr.responseText) as TmpFile,
            error: null,
          });
        } catch {
          resolve({ data: null, error: "Invalid response from server" });
        }
      } else {
        resolve({ data: null, error: "Failed to create temporary file link" });
      }
    };

    xhr.onerror = () => {
      resolve({ data: null, error: "Failed to create temporary file link" });
    };

    xhr.send(formData);
  });
};
