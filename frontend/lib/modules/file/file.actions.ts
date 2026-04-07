"use server";

import { clientEnv } from "@/lib/env";
import { APIError, parseServerError } from "@/lib/errors";
import { ServerAPICall } from "@/lib/fetch/server";
import { GitCloneFormType } from "@/lib/modules/file/file.schema";
import { FileIDResponse, FolderResponse } from "@/lib/modules/file/file.types";

type FileInfoParams =
  | { path: string; id?: never }
  | { path?: never; id: number };

export const getFileInfoByPathOrID = async ({
  path,
  id,
}: FileInfoParams): Promise<FileIDResponse> => {
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
    const message = await parseServerError(response, "Failed to fetch file info");
    throw new APIError(message, response.status);
  }

  return response.json() as Promise<FileIDResponse>;
};

export const getFileContentById = async (id: number): Promise<Response> => {
  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/${id}/content`,
  );

  if (!response.ok) {
    const message = await parseServerError(response, `Failed to fetch file content for id: ${id}`);
    throw new APIError(message, response.status);
  }

  return response;
};

export const getFileContentByPath = async (path: string): Promise<Response> => {
  const data = await getFileInfoByPathOrID({ path });
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
    },
  );

  if (!response.ok) {
    const message = await parseServerError(response, "Failed to upload file");
    throw new APIError(message, response.status);
  }

  return response.json() as Promise<FileIDResponse>;
};

export const updateFile = async (
  id: number,
  formData: FormData,
): Promise<FileIDResponse> => {
  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/${id}/update`,
    {
      method: "PATCH",
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await parseServerError(response, "Failed to update file");
    throw new APIError(message, response.status);
  }

  return response.json() as Promise<FileIDResponse>;
};

export const getFolderByPath = async (
  path: string,
  expand: boolean = true,
): Promise<FolderResponse> => {
  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/folders?path=${path}&expand=${expand}`,
  );

  if (!response.ok) {
    const message = await parseServerError(response, "Failed to fetch folder");
    throw new APIError(message, response.status);
  }

  return response.json() as Promise<FolderResponse>;
};

export const gitCloneFile = async (data: GitCloneFormType): Promise<FileIDResponse> => {
  const response = await ServerAPICall(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/files/git-clone`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await parseServerError(response, "Failed to clone repository");
    throw new APIError(message, response.status);
  }

  return response.json() as Promise<FileIDResponse>;
};
