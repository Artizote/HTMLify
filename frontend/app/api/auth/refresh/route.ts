import { cookies } from "next/headers";

import { RefreshToken } from "@/lib/modules/auth/auth.actions";

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
  cookieStore.set("access_token", result.access_token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1800,
    secure: process.env.NODE_ENV === "production",
  });

  return new Response(JSON.stringify({ access_token: result.access_token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
