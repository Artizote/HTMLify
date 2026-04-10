import { cookies } from "next/headers";

import { RefreshToken } from "@/lib/modules/auth/auth.actions";

import { setCookie } from "../utils";

export async function GET() {
  console.log("refreshing access token");
  const result = await RefreshToken();

  if (result.status !== 200 || !result.access_token) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: result.status || 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cookieStore = await cookies();
  setCookie(cookieStore, result.access_token, "access_token");

  return new Response(JSON.stringify({ access_token: result.access_token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
