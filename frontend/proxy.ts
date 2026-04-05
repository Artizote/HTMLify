import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clientEnv } from "@/lib/env";
import {
  AUTH_ONLY_ROUTES,
  excludePaths,
  getSubdomain,
  handleAuthOrProtectedRoute,
  PROTECTED_ROUTES,
  redirectToSubdomain,
  serverFile,
} from "@/lib/modules/proxy/proxy.utils";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (excludePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const totalExcludeRoute = AUTH_ONLY_ROUTES.concat(PROTECTED_ROUTES);
  const subdomain = getSubdomain(request);
  if (totalExcludeRoute.some((path: string) => pathname.startsWith(path))) {
    if (subdomain !== clientEnv.NEXT_PUBLIC_SUBDOMAIN) {
      return redirectToSubdomain(request, clientEnv.NEXT_PUBLIC_SUBDOMAIN);
    }
    return await handleAuthOrProtectedRoute(request, pathname);
  }

  return await serverFile(pathname);
}

export const config = {
  matcher: ["/:path*"],
};
