import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { UserFullInfo } from "@/lib/modules/user/user.types";
const isServer = typeof window === "undefined";
export async function getMe(): Promise<UserFullInfo | null> {
  try {
    if (isServer) {
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const cached = headersList.get("x-user-data");
      if (cached) {
        return JSON.parse(cached) as UserFullInfo;
      }
    }
  } catch {}

  try {
    const res = await APICall(`${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`);

    if (!res.ok) return null;

    return res.json() as Promise<UserFullInfo>;
  } catch (error) {
    console.error("[getMe] Error fetching user info:", error);
    return null;
  }
}
