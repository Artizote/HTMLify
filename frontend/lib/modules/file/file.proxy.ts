import { NextResponse } from "next/server";

import {
  getFileContentById,
  getFileInfoByPathOrID,
} from "@/lib/modules/file/file.api";

export const serverFile = async (pathname: string) => {
  try {
    const fileInfo = await getFileInfoByPathOrID({ path: pathname });
    if (!fileInfo || fileInfo.mode === "source") {
      console.log("source file");
      return NextResponse.next();
    }

    const resp = await getFileContentById(fileInfo.id);
    if (!resp || !resp.ok) {
      return NextResponse.next();
    }
    return resp;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.next();
  }
};
