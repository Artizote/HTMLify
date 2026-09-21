import { env } from "@/lib/env";
import { APICall as APICall } from "@/lib/fetch/api";
import { GitCloneFormType } from "@/lib/modules/file/file.schema";
import { FileIDResponse, FolderResponse } from "@/lib/modules/file/file.types";

type FileInfoParams =
  { path: string; id?: never } | { path?: never; id: number };

export const getFileInfoByPathOrID = async ({
  path,
  id,
}: FileInfoParams): Promise<{
  data: FileIDResponse | null;
  error: string | null;
}> => {
  let params = "";
  if (path) {
    params = `path=${path}`;
  } else if (id) {
    params = `id=${id}`;
  }

  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files?${params}`,
  );

  if (error) return { data: null, error };
  return { data: (await response?.json()) as FileIDResponse, error: null };
};

export const getFileContentById = async (
  id: number,
): Promise<Response | null> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/${id}/content`,
  );

  if (error || !response) {
    return null;
  }
  return response;
};

export const getFileContentByPath = async (
  path: string,
): Promise<Response | null> => {
  const { data, error } = await getFileInfoByPathOrID({ path });
  if (error || !data) {
    return null;
  }
  return getFileContentById(data.id);
};

export const uploadFile = async (
  formData: FormData,
): Promise<{ data: FileIDResponse | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (error || !response) {
    return { data: null, error: error || "Failed to upload file" };
  }
  return { data: (await response.json()) as FileIDResponse, error: null };
};

interface UploadFileOptions {
  onProgress?: (progress: number) => void;
}

export const uploadFileWithProgress = async (
  formData: FormData,
  options?: UploadFileOptions,
): Promise<{ data: FileIDResponse | null; error: string | null }> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/upload`);
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
            data: JSON.parse(xhr.responseText) as FileIDResponse,
            error: null,
          });
        } catch {
          resolve({ data: null, error: "Invalid response from server" });
        }
      } else {
        let msg = "Upload failed";
        try {
          const body = JSON.parse(xhr.responseText);
          msg = body?.detail ?? msg;
        } catch {}
        resolve({ data: null, error: msg });
      }
    };

    xhr.onerror = () => {
      resolve({ data: null, error: "Failed to upload file" });
    };

    xhr.send(formData);
  });
};

export const updateFile = async (
  id: number,
  formData: FormData,
): Promise<{ data: FileIDResponse | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/${id}/update`,
    {
      method: "PATCH",
      body: formData,
    },
  );

  if (error || !response) {
    return { data: null, error: error || "Failed to update file" };
  }
  return { data: (await response.json()) as FileIDResponse, error: null };
};

export const deleteFile = async (id: number) => {
  const { error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/${id}`,
    {
      method: "DELETE",
    },
  );

  return { error };
};

export const getFolderByPath = async (
  path: string,
  expand: boolean = true,
  page: number = 1,
  pageSize: number = env.NEXT_PUBLIC_PAGE_SIZE,
): Promise<{ data: FolderResponse | null; error: string | null }> => {
  const params = new URLSearchParams({
    path,
    expand: expand.toString(),
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/folders?${params.toString()}`,
  );

  if (error || !response) {
    return { data: null, error: error || "Failed to fetch folder" };
  }
  return { data: (await response.json()) as FolderResponse, error: null };
};

export const gitCloneFile = async (
  data: GitCloneFormType,
): Promise<{ data: FileIDResponse | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/git-clone`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (error || !response) {
    return { data: null, error: error || "Failed to clone repository" };
  }
  return { data: (await response.json()) as FileIDResponse, error: null };
};
