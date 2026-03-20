import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getFileContentById, getFileIDByPath } from './lib/actons/file'

const excludePaths = ["/about", "/_next", "/api", "/favicon.ico", "/dashboard"]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (excludePaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

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



export const config = {
    matcher: ["/:path*"],
}