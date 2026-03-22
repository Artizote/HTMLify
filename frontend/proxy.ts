import { AUTH_ONLY_ROUTES, excludePaths, hadleAuthOrProtectedRoute, PUBLIC_ROUTES, serverFile } from '@/lib/actons/proxy-utils'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'



export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (excludePaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    const totalExcludeRoute = PUBLIC_ROUTES.concat(AUTH_ONLY_ROUTES)
    if (totalExcludeRoute.some((path) => pathname.startsWith(path))) {
        return await hadleAuthOrProtectedRoute(request, pathname)
    }

    return await serverFile(pathname)

}



export const config = {
    matcher: ["/:path*"],
}