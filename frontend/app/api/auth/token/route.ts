import { cookies } from "next/headers";

import { env } from "@/lib/env";

import { setCookie } from "../utils";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/auth/token`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      return response;
    }

    const data: { access_token: string; refresh_token: string } =
      await response.json();

    const cookieStore = await cookies();

    setCookie(cookieStore, data.access_token, "access_token");
    setCookie(cookieStore, data.refresh_token, "refresh_token");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Token route error:", error);
    return new Response(JSON.stringify({ detail: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
