import { NextResponse } from "next/server";

import { getOriginalUrlFromShort } from "@/lib/modules/shortlink/shortlink.api";
import { env } from "@/lib/env";

export const serveShortlink = async (pathname: string) => {
  const short = pathname.split("/")[2] || "";
  if (!short) {
    return null;
  }
  const data = await getOriginalUrlFromShort(short);
  if (!data) {
    return null;
  }
  return NextResponse.redirect(new URL(data.href, env.NEXT_PUBLIC_SITE_URL + "/r/"));
};
