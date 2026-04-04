"use server";

import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env";
import { refreshTokenFromCookie } from "@/lib/modules/auth/auth.actions";
import { UserFullInfo } from "@/lib/modules/user/user.types";

async function fetchMe(accessToken: string): Promise<UserFullInfo | null> {
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`,
    {
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json() as Promise<UserFullInfo>;
}

export async function getMe(): Promise<UserFullInfo | null> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;

  if (accessToken) {
    const user = await fetchMe(accessToken);
    if (user) return user;
    console.debug("[getMe] Access token expired, attempting refresh...");
  } else {
    console.debug("[getMe] No access token found, attempting refresh...");
  }

  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) {
    console.debug("[getMe] No refresh token available, user is logged out");
    return null;
  }

  accessToken = (await refreshTokenFromCookie(refreshToken)) ?? undefined;
  if (!accessToken) {
    console.debug("[getMe] Token refresh failed");
    return null;
  }

  return fetchMe(accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) return null;

    accessToken = (await refreshTokenFromCookie(refreshToken)) ?? undefined;
  }

  return accessToken || null;
}
