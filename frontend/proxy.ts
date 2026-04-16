import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AUTH_ONLY_ROUTES,
  excludePaths,
  handleAuthOrProtectedRoute,
  PROTECTED_ROUTES,
  serverFile,
  serveShortlink,
} from "@/lib/modules/proxy/proxy.utils";

const shortnerPaths = ["/r"];
const matchRoute = (route: string, routes: string[]) =>
  routes.some((r) => route === r || route.startsWith(r + "/"));

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

  return await serverFile(pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\.well-known|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
    "/((?!about).*)",
  ],
};
