import { NextResponse } from "next/server";

import { getOriginalUrlFromShort } from "@/lib/modules/shortlink/shortlink.api";

export const serveShortlink = async (pathname: string) => {
  try {
    const short = pathname.split("/")[2] || "";
    if (!short) {
      return null;
    }
    const data = await getOriginalUrlFromShort(short);
    return NextResponse.redirect(data.href);
  } catch (error) {
    console.error("Proxy error:", error);
    return null;
  }
};
