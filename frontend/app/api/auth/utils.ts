import { cookies } from "next/headers";

import { env } from "@/lib/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function setCookie(
  cookieStore: CookieStore,
  token: string,
  type: "access_token" | "refresh_token",
) {
  cookieStore.set(type, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:
      60 *
      (type === "access_token"
        ? env.ACCESS_TOKEN_EXPIRE_MINUTES
        : 60 * 24 * env.REFRESH_TOKEN_EXPIRE_DAYS),
    path: "/",
  });
}

export { setCookie };
