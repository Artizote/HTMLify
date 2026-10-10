import { NextRequest } from "next/server";

import { env } from "@/lib/env";

// Internal API endpoints
// which are allowwed to be fetch from client side
const ALLOWED_INTERNAL = ["internal/frames/feed"];

async function proxyHandler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${env.NEXT_PUBLIC_BACKEND_API_URL}/${path}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.delete("content-encoding");


  // only allowed paths
  if (path.startsWith("internal/")) {
    if (!ALLOWED_INTERNAL.includes(path)) {
      return new Response("Not found", { status: 404 });
    }
    headers.set("X-Internal-Code", env.INTERNAL_API_CODE);
  }

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
