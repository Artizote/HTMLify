import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { UserFullInfo } from "@/lib/modules/user/user.types";

export {
  AUTH_ONLY_ROUTES,
  PROTECTED_ROUTES,
  DASHBOARD_ROUTES,
} from "@/lib/modules/proxy/proxy.config";

import {
  AUTH_ONLY_ROUTES,
  PROTECTED_ROUTES,
} from "@/lib/modules/proxy/proxy.config";

async function fetchMe(): Promise<{
  user: UserFullInfo | null;
  refreshedToken?: string;
}> {
  const { response, error, refreshedToken } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`,
  );
  if (error) return { user: null, refreshedToken };
  const user = (await response?.json()) as UserFullInfo;
  return { user, refreshedToken };
}

export const handleAuthOrProtectedRoute = async (
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> => {
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const { user, refreshedToken } = await fetchMe();
  let response: NextResponse;

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      response = NextResponse.redirect(url);
    } else {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-data", JSON.stringify(user));
      response = NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  } else if (isAuthOnlyRoute) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  if (refreshedToken) {
    const { setCookie } = await import("@/app/api/auth/utils");
    await setCookie(response.cookies, refreshedToken, "access_token");
  }

  return response;
};
