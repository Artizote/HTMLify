/* Will surely  refector this later,
 * curretnly just copi pasted from tmp.proxy.ts
 * */
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";

export const serveUserDp = async (username: string) => {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/${username}/dp`,
  );

  if (error || !response) {
    return NextResponse.next();
  }

  return response;
};
