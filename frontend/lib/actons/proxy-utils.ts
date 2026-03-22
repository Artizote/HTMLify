import { refreshTokenFromCookie } from "@/lib/actons/auth"
import { getFileContentById, getFileIDByPath } from "@/lib/actons/file";
import { BACKEND_API_URL } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server"


const excludePaths = ["/about", "/_next", "/api", "/favicon.ico"]

const PUBLIC_ROUTES = ["/signin", "/signup"];
const AUTH_ONLY_ROUTES = ["/signin", "/signup"];

const serverFile = async (pathname: string): Promise<NextResponse> => {
    try {
        const fileInfo = await getFileIDByPath(pathname)
        if (!fileInfo || fileInfo.mode === "source") {
            console.log("source file")
            return NextResponse.next()
        }

        const resp = await getFileContentById(fileInfo.id)
        if (!resp || !resp.ok) {
            return NextResponse.next()
        }

        const contentType = resp.headers.get("content-type") || "text/html"
        const buffer = await resp.arrayBuffer()

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
            },
        })
    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.next()
    }
}

async function verifyAccessToken(accessToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/v1/users/me`, {
            headers: { Cookie: `access_token=${accessToken}` },
            cache: "no-store",
        });
        return res.ok;
    } catch {
        return false;
    }
}

const hadleAuthOrProtectedRoute = async (request: NextRequest, pathname: string): Promise<NextResponse> => {
    const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));
    const isProtectedRoute = !PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    if (!isProtectedRoute && !isAuthOnlyRoute) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    let isAuthenticated = false;
    let newAccessToken: string | null = null;

    if (accessToken) {
        isAuthenticated = await verifyAccessToken(accessToken);
    }

    if (!isAuthenticated && refreshToken && isProtectedRoute) {
        newAccessToken = await refreshTokenFromCookie(refreshToken);
        isAuthenticated = newAccessToken !== null;
    }

    if (isAuthOnlyRoute && isAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
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

export { serverFile, hadleAuthOrProtectedRoute, verifyAccessToken, excludePaths, PUBLIC_ROUTES, AUTH_ONLY_ROUTES }