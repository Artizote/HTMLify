import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AUTH_ONLY_ROUTES,
  excludePaths,
  handleAuthOrProtectedRoute,
  PROTECTED_ROUTES,
  serverFile,
} from "@/lib/modules/proxy/proxy.utils";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
