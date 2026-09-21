import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import {
  TmpFolderFile,
  TmpFolderResponse,
} from "@/lib/tmp-folder/tmp-folder.types";

export const createTmpFolder = async (
  folderName: string,
): Promise<{ data: TmpFolderResponse | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: folderName }),
    },
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to create temporary folder" };
  }
  return { data: (await response.json()) as TmpFolderResponse, error: null };
};

export const AddFileToTmpFolder = async ({
  tmpFolderId,
  tmpFileId,
  authCode,
}: {
  tmpFolderId: string;
  tmpFileId: string;
  authCode: string;
}): Promise<{ data: TmpFolderResponse | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders/${tmpFolderId}/files`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_code: authCode, id: tmpFileId }),
    },
  );
  if (error || !response) {
    return {
      data: null,
      error: error || "Failed to add file to temporary folder",
    };
  }
  return { data: (await response.json()) as TmpFolderResponse, error: null };
};

export const DeleteTmpFileFromFolder = async ({
  tmpFolderId,
  tmpFileId,
  authCode,
}: {
  tmpFolderId: string;
  tmpFileId: string;
  authCode: string;
}): Promise<{ data: TmpFolderResponse | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders/${tmpFolderId}/files`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_code: authCode, id: tmpFileId }),
    },
  );
  if (error || !response) {
    return {
      data: null,
      error: error || "Failed to delete file from temporary folder",
    };
  }
  return { data: (await response.json()) as TmpFolderResponse, error: null };
};

export const getTmpFolderFiles = async (
  id: string,
): Promise<{ data: TmpFolderFile[] | null; error: string | null }> => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders/${id}/files`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (error || !response) {
    return {
      data: null,
      error: error || "Failed to get temporary folder files",
    };
  }
  return { data: (await response.json()) as TmpFolderFile[], error: null };
};
