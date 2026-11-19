import { NextResponse } from "next/server";
import { getShortLinkByShort, hitShortLink } from "lib/modules/shortlink/shortlink.api";
import { env } from "@/lib/env";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // in future `short` would be renamed to `id`
  const { id } = await params;
  const shortlink = await getShortLinkByShort(id);
  if (!shortlink) {
    return NextResponse.redirect(new URL("/r", env.NEXT_PUBLIC_SITE_URL));
  }
  hitShortLink(shortlink.id);
  return NextResponse.redirect(new URL(shortlink.href, env.NEXT_PUBLIC_SITE_URL + "/r/"));
}
