import { NextRequest, NextResponse } from "next/server";

import { clientEnv } from "@/lib/env";
import { RefreshToken } from "@/lib/modules/auth/auth.actions";
import {
  getFileContentById,
  getFileInfoByPathOrID,
} from "@/lib/modules/file/file.actions";

const excludePaths = ["/about", "/_next", "/api", "/favicon.ico"];

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

export function getSubdomain(request: NextRequest): string {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // strip port

  const parts = hostname.split(".");

  // e.g. "app.localhost" → ["app", "localhost"] → "app"
  // e.g. "app.example.com" → ["app", "example", "com"] → "app"
  // e.g. "localhost" or "example.com" → no subdomain → ""
  if (parts.length <= 1) return "";

  const isLocalhost = parts[parts.length - 1] === "localhost";

  if (isLocalhost) {
    // app.localhost → subdomain is everything before "localhost"
    return parts.slice(0, -1).join(".");
  }

  // For real domains, subdomain is everything before the last two parts
  // e.g. app.example.com → parts = ["app", "example", "com"] → "app"
  // e.g. a.b.example.com → "a.b"
  if (parts.length <= 2) return ""; // no subdomain (e.g. "example.com")

  return parts.slice(0, -2).join(".");
}

export function redirectToSubdomain(
  request: NextRequest,
  subdomain: string,
): NextResponse {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";

  const prefix = subdomain != "" ? `${subdomain}.` : "";

  const newHostname = `${prefix}${hostname.replace(/^[^.]+\./, "")}`;

  const newUrl = new URL(request.url);
  newUrl.host = `${newHostname}${port}`;

  console.log({ newUrl });
  return NextResponse.redirect(newUrl);
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
