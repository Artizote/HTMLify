import { cookies } from "next/headers";

import { clientEnv } from "@/lib/env";

interface RefreshTokenResponse {
  access_token: string | null;
  status: number;
  error: string;
}

export async function RefreshToken(): Promise<RefreshTokenResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken)
    return {
      access_token: null,
      status: 401,
      error: "No refresh token provided",
    };

  try {
    const response = await fetch(
      `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/auth/refresh`,
      {
        method: "GET",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      },
    );

    if (!response.ok) {
      return {
        access_token: null,
        status: response.status,
        error: "Failed to refresh token",
      };
    }

    const data: { access_token: string } = await response.json();

    return {
      access_token: data.access_token,
      status: 200,
      error: "",
    };
  } catch (error) {
    console.error("RefreshToken function error:", error);
    return {
      access_token: null,
      status: 500,
      error: "An unexpected error occurred",
    };
  }
}
