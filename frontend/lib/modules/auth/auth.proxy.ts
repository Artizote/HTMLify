import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { UserFullInfo } from "@/lib/modules/user/user.types";

export const AUTH_ONLY_ROUTES = ["/signin", "/signup"];
export const PROTECTED_ROUTES = ["/dashboard"];

async function fetchMe(): Promise<UserFullInfo | null> {
  try {
    const res = await APICall(`${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`);
    if (!res.ok) return null;
    return (await res.json()) as UserFullInfo;
  } catch {
    return null;
  }
}

export const handleAuthOrProtectedRoute = async (
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> => {
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const user = await fetchMe();

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-data", JSON.stringify(user));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (isAuthOnlyRoute) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
};
