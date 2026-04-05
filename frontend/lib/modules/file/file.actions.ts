"use server";

import { clientEnv } from "@/lib/env";
import { ServerAPICall } from "@/lib/fetch/server";
import { FileIDResponse, FolderResponse } from "@/lib/modules/file/file.types";
type FileInfoParams =
  | { path: string; id?: never }
  | { path?: never; id: number };

export const getFileInfoByPathOrID = async ({
  path,
  id,
}: FileInfoParams): Promise<FileIDResponse | null> => {
  let params = "";

  if (path) {
    params = `path=${path}`;
  } else if (id) {
    params = `id=${id}`;
  }

  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files?${params}`,
  );

  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<FileIDResponse>;
};

export const getFileContentById = async (
  id: number,
): Promise<Response | null> => {
  const response = await ServerAPICall(
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
  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/upload`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return response.json() as Promise<FileIDResponse>;
};

export const getFolderByPath = async (path: string, expand: boolean = true) => {
  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/folders?path=${path}&expand=${expand}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch folder");
  }

  return response.json() as Promise<FolderResponse>;
};
