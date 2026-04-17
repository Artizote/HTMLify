import { NextResponse } from "next/server";

import { getTmpFileContentById } from "@/lib/modules/tmp/tmp.api";

export const serveTmpFile = async (fileID: string) => {
  try {
    const resp = await getTmpFileContentById(fileID);

    if (!resp || !resp.ok || !resp.body) {
      return NextResponse.next();
    }

    return resp;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.next();
  }
};
