import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { RefreshToken } from "@/lib/modules/auth/auth.actions";

export const AUTH_ONLY_ROUTES = ["/signin", "/signup"];
export const PROTECTED_ROUTES = ["/dashboard"];

export async function verifyAccessToken(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`, {
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const handleAuthOrProtectedRoute = async (
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> => {
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtectedRoute) {
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    let isAuthenticated = false;
    let newAccessToken: string | null = null;

    if (accessToken) {
      isAuthenticated = await verifyAccessToken(accessToken);
    }

    if (!isAuthenticated && refreshToken) {
      const result = await RefreshToken();
      newAccessToken = result.access_token;
      isAuthenticated = newAccessToken !== null;
    }

    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();

    if (newAccessToken) {
      response.cookies.set("access_token", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1800,
        path: "/",
      });
    }

    return response;
  }

  if (isAuthOnlyRoute) {
    const accessToken = request.cookies.get("access_token")?.value;

    if (accessToken) {
      const isAuthenticated = await verifyAccessToken(accessToken);
      if (isAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
};
