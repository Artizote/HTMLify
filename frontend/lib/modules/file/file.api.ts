import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { uploadWithProgress } from "@/lib/fetch/xhr";
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
  const result = await uploadWithProgress(
    "POST",
    `/api/v1/files/upload`,
    formData,
    options?.onProgress,
  );

  if (!result) {
    return { data: null, error: "Failed to upload file" };
  }

  if (result.status >= 200 && result.status < 300) {
    try {
      return {
        data: JSON.parse(result.responseText) as FileIDResponse,
        error: null,
      };
    } catch {
      return { data: null, error: "Invalid response from server" };
    }
  }

  let msg = "Upload failed";
  try {
    const body = JSON.parse(result.responseText);
    msg = body?.detail ?? msg;
  } catch {}
  return { data: null, error: msg };
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
  sort?: string,
): Promise<{ data: FolderResponse | null; error: string | null }> => {
  const params = new URLSearchParams({
    path,
    expand: expand.toString(),
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (sort) {
    params.set("sort", sort);
  }

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
