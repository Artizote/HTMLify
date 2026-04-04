import { clientEnv } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const targetPath = path === "signup" ? `v1/users` : `v1/auth/${path}`;
  const targetUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${targetPath}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("host");

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: requestHeaders,
      body: request.body,
      // @ts-expect-error - duplex is required for proxying streams in fetch but not in standard TS types yet
      duplex: "half",
    });

    const body = await response.json();
    const nextResponse = NextResponse.json(body, {
      status: response.status,
    });

    // Proxy the Set-Cookie headers
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      // Spliting multiple cookies if present
      const cookies = setCookie.split(/,(?=\s*[^,;]+=[^,;]+)/);
      cookies.forEach((cookie) => {
        nextResponse.headers.append("set-cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error in auth proxy" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const targetUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/auth/${path}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("host");

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: requestHeaders,
    });

    const body = await response.json();
    const nextResponse = NextResponse.json(body, {
      status: response.status,
    });

    // Proxy the Set-Cookie headers
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const cookies = setCookie.split(/,(?=\s*[^,;]+=[^,;]+)/);
      cookies.forEach((cookie) => {
        nextResponse.headers.append("set-cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error in auth proxy" },
      { status: 500 },
    );
  }
}
