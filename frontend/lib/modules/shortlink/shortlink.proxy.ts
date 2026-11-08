import { NextResponse } from "next/server";

import { getShortLinkByShort, hitShortLink } from "lib/modules/shortlink/shortlink.api"
import { env } from "@/lib/env";

export const serveShortlink = async (pathname: string) => {
  const short = pathname.split("/")[2] || "";
  if (!short) {
    return null;
  }
  const shortlink = await getShortLinkByShort(short);
  if (!shortlink) {
    return null;
  }
  hitShortLink(shortlink.id);
  return NextResponse.redirect(new URL(shortlink.href, env.NEXT_PUBLIC_SITE_URL + "/r/"));
};
