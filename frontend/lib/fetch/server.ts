import { cookies } from "next/headers";

import { RefreshToken } from "@/lib/modules/auth/auth.actions";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("access_token")?.value;
  if (existing) return existing;

  const result = await RefreshToken();
  if (result.status !== 200 || !result.access_token) return null;

  return result.access_token;
}

const makeHeaders = (
  accessToken: string | null,
  options: RequestInit = {},
): HeadersInit => {
  if (!accessToken) return options.headers || {};
  return {
    ...options.headers,
    Cookie: `access_token=${accessToken}`,
  };
};

export async function ServerAPICall(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const headers = makeHeaders(token, options);
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const result = await RefreshToken();
    if (result.status !== 200 || !result.access_token) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status || 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    response = await fetch(url, {
      ...options,
      headers: makeHeaders(result.access_token, options),
    });
  }

  return response;
}
