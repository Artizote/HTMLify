import { NextResponse } from "next/server";

import {
  getFileContentById,
  getFileInfoByPathOrID,
} from "@/lib/modules/file/file.api";
import { FileMode } from "@/lib/modules/file/file.types";
import { getFileContentType } from "@/lib/modules/file/file.utils";

const serveFileContent = async (
  id: number,
  mode: FileMode,
  pathname: string,
) => {
  if (mode === "source") {
    return NextResponse.next();
  }
  const resp = await getFileContentById(id);
  if (!resp || !resp.ok) {
    return NextResponse.next();
  }
  if (mode === "raw") {
    if (
      getFileContentType(pathname, resp.headers.get("content-type")) === "other"
    ) {
      return new NextResponse(resp.body, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
  }
  return resp;
};

export const serverFile = async (pathname: string) => {
  const firstPath = pathname.split("/")[1];
  let filePath = pathname;
  let mode: FileMode = "source";
  if (firstPath === "src") {
    return NextResponse.next();
  }
  if (firstPath === "raw" || firstPath === "render") {
    filePath = "/" + pathname.split("/").slice(2).join("/");
    mode = firstPath;
  }

  try {
    console.log("filePath", filePath);
    const fileInfo = await getFileInfoByPathOrID({ path: filePath });
    if (!fileInfo) {
      return NextResponse.next();
    }
    if (mode === "source") {
      mode = fileInfo.mode;
    }
    return await serveFileContent(fileInfo.id, mode, filePath);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.next();
  }
};
