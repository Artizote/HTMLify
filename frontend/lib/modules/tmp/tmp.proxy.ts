import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";

export const serveTmpFile = async (fileID: string) => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/tmpfiles/${fileID}/content`,
  );

  if (error || !response) {
    return NextResponse.next();
  }

  return response;
};
