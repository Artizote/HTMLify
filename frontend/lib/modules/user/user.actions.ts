import { clientEnv } from "@/lib/env";
import { ServerAPICall } from "@/lib/fetch/server";
import { UserFullInfo } from "@/lib/modules/user/user.types";

export async function getMe(): Promise<UserFullInfo | null> {
  try {
    const res = await ServerAPICall(
      `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`,
    );

    if (!res.ok) return null;

    return res.json() as Promise<UserFullInfo>;
  } catch (error) {
    console.error("[getMe] Error fetching user info:", error);
    return null;
  }
}
