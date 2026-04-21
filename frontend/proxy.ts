import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AUTH_ONLY_ROUTES,
  handleAuthOrProtectedRoute,
  PROTECTED_ROUTES,
} from "@/lib/modules/auth/auth.proxy";
import { serverFile } from "@/lib/modules/file/file.proxy";
import { excludePaths } from "@/lib/modules/proxy/proxy.config";
import { serveShortlink } from "@/lib/modules/shortlink/shortlink.proxy";
import { serveTmpFile } from "@/lib/modules/tmp/tmp.proxy";

const shortnerPaths = ["/r"];
const tmpPaths = ["/tmp"];
const matchRoute = (route: string, routes: string[]) =>
  routes.some((r) => route === r || route.startsWith(r + "/"));

const isTmp = (pathname: string) => matchRoute(pathname, tmpPaths);
const isShortLink = (pathname: string) => matchRoute(pathname, shortnerPaths);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isShortLink(pathname)) {
    const redirect = await serveShortlink(pathname);
    if (redirect) {
      return redirect;
    }
  }

  if (excludePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const totalExcludeRoute = AUTH_ONLY_ROUTES.concat(PROTECTED_ROUTES);
  if (totalExcludeRoute.some((path: string) => pathname.startsWith(path))) {
    return await handleAuthOrProtectedRoute(request, pathname);
  }

  if (isTmp(pathname)) {
    const id = pathname.split("/")[2];
    if (id && id !== "f") {
      return await serveTmpFile(id);
    }
    return;
  }

  return await serverFile(pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\.well-known|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
    "/((?!about).*)",
  ],
};
