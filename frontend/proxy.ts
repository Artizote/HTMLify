import {
  AUTH_ONLY_ROUTES,
  excludePaths,
  handleAuthOrProtectedRoute,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  serverFile,
} from "@/lib/modules/proxy/proxy.utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (excludePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const totalExcludeRoute =
    PUBLIC_ROUTES.concat(AUTH_ONLY_ROUTES).concat(PROTECTED_ROUTES);
  if (totalExcludeRoute.some((path) => pathname.startsWith(path))) {
    return await handleAuthOrProtectedRoute(request, pathname);
  }

  return await serverFile(pathname);
}

export const config = {
  matcher: ["/:path*"],
};
