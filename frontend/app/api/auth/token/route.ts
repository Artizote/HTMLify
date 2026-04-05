import { cookies } from "next/headers";

import { clientEnv } from "@/lib/env";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    const response = await fetch(
      `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/auth/token`,
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

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/",
    });

    cookieStore.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

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
