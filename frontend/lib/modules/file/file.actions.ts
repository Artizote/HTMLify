import { FileIDResponse, FolderResponse } from "@/lib/modules/file/file.types";
import { clientEnv } from "@/lib/env";
import { apiFetch } from "@/lib/fetch";

export const getFileInfoByPathOrID = async ({
  path,
  id,
}: {
  path?: string;
  id?: number;
}): Promise<FileIDResponse | null> => {
  if (!path && !id) {
    return null;
  }
  let params = "";
  if (path) {
    params = `path=${path}`;
  } else if (id) {
    params = `id=${id}`;
  }
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files?${params}`,
  );
  if (!response.ok) {
    return null;
  }
  const data: FileIDResponse = await response.json();
  return data;
};

export const getFileContentById = async (
  id: number,
): Promise<Response | null> => {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/${id}/content`,
  );
  if (!response.ok) {
    console.error(`Failed to fetch file content for id: ${id}`);
    return null;
  }
  return response;
};

export const getFileContentByPath = async (path: string) => {
  const data = await getFileInfoByPathOrID({ path: path });
  if (!data) return null;
  return getFileContentById(data.id);
};

export const uploadFile = async (
  formData: FormData,
): Promise<FileIDResponse> => {
  return apiFetch<FileIDResponse>(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
};

export const getFolderByPath = async (path: string, expand: boolean = true) => {
  return apiFetch<FolderResponse>(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/folders?path=${path}&expand=${expand}`,
  );
};
