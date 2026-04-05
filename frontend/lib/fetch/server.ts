import { cookies } from "next/headers";

import { RefreshToken } from "@/lib/modules/auth/auth.actions";

async function getAccessToken(): Promise<{
  token: string | null;
  error?: Response;
}> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("access_token")?.value;
  if (existing) return { token: existing };

  const result = await RefreshToken();
  if (result.status !== 200 || !result.access_token) {
    return {
      token: null,
      error: new Response(JSON.stringify({ error: result.error }), {
        status: result.status || 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { token: result.access_token };
}

const makeHeaders = (
  accessToken: string,
  options: RequestInit = {},
): HeadersInit => ({
  ...options.headers,
  Cookie: `access_token=${accessToken}`,
});

export async function ServerAPICall(url: string, options: RequestInit = {}) {
  const { token, error } = await getAccessToken();
  if (!token) return error!;

  let response = await fetch(url, {
    ...options,
    headers: makeHeaders(token, options),
  });

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
