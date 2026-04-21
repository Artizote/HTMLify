import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import {
  TmpFolderFile,
  TmpFolderResponse,
} from "@/lib/tmp-folder/tmp-folder.types";

export const createTmpFolder = async (folderName: string) => {
  try {
    const resp = await APICall(
      `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: folderName }),
      },
    );
    return resp.json() as Promise<TmpFolderResponse>;
  } catch (error) {
    console.log(error);
  }
};

export const AddFileToTmpFolder = async ({
  tmpFolderId,
  tmpFileId,
  authCode,
}: {
  tmpFolderId: string;
  tmpFileId: string;
  authCode: string;
}) => {
  try {
    const resp = await APICall(
      `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders/${tmpFolderId}/files`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auth_code: authCode, id: tmpFileId }),
      },
    );
    return resp.json() as Promise<TmpFolderResponse>;
  } catch (error) {
    console.log(error);
  }
};

export const getTmpFolderFiles = async (id: string) => {
  try {
    const resp = await APICall(
      `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-folders/${id}/files`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return resp.json() as Promise<TmpFolderFile[]>;
  } catch (error) {
    console.log(error);
  }
};
