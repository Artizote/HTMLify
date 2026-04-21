import { env } from "@/lib/env";
import { APIError, parseServerError } from "@/lib/errors";
import { APICall } from "@/lib/fetch/api";

import { TmpFile, TmpFormType } from "./tmp.types";

export const getTmpFileContentById = async (id: string): Promise<Response> => {
  const response = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-files/${id}/content`,
  );

  if (!response.ok) {
    const message = await parseServerError(
      response,
      `Failed to fetch tmp file content for id: ${id}`,
    );
    throw new APIError(message, response.status);
  }
  return response;
};

export const createTmpFile = async (data: TmpFormType): Promise<TmpFile> => {
  const formData = new FormData();
  if (data.file) {
    formData.append("file", data.file);
  }
  if (data.name) {
    formData.append("name", data.name);
  }
  formData.append("expiry", data.expiry.toString());

  const response = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmp-files`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await parseServerError(
      response,
      "Failed to create temporary file link",
    );
    throw new APIError(message, response.status);
  }

  return (await response.json()) as TmpFile;
};
