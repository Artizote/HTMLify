import { NextRequest, NextResponse } from "next/server";

import { clientEnv } from "@/lib/env";
import { RefreshToken } from "@/lib/modules/auth/auth.actions";
import {
  getFileContentById,
  getFileInfoByPathOrID,
} from "@/lib/modules/file/file.api";

const excludePaths = [
  "/about",
  "/_next",
  "/api",
  "/favicon.ico",
  "/.well-known",
];

const AUTH_ONLY_ROUTES = ["/signin", "/signup"];
const PROTECTED_ROUTES = ["/dashboard"];

const serverFile = async (pathname: string): Promise<NextResponse> => {
  try {
    const fileInfo = await getFileInfoByPathOrID({ path: pathname });
    if (!fileInfo || fileInfo.mode === "source") {
      console.log("source file");
      return NextResponse.next();
    }

    const resp = await getFileContentById(fileInfo.id);
    if (!resp || !resp.ok) {
      return NextResponse.next();
    }

    const contentType = resp.headers.get("content-type") || "text/html";
    const buffer = await resp.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.next();
  }
};

async function verifyAccessToken(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`,
      {
        headers: { Cookie: `access_token=${accessToken}` },
        cache: "no-store",
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

const handleAuthOrProtectedRoute = async (
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

export {
  AUTH_ONLY_ROUTES,
  excludePaths,
  handleAuthOrProtectedRoute,
  PROTECTED_ROUTES,
  serverFile,
  verifyAccessToken,
};
