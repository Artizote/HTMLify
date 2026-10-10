import { env } from "@/lib/env";
import { parseServerError } from "@/lib/errors";
let clientRefreshPromise: Promise<boolean> | null = null;

async function executeClientRefresh() {
  if (clientRefreshPromise) return clientRefreshPromise;
  clientRefreshPromise = fetch(`/api/auth/refresh`, {
    method: "GET",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      clientRefreshPromise = null;
    });
  return clientRefreshPromise;
}

type APIResponse =
  | {
      response: Response;
      error: null;
      refreshedToken?: string;
    }
  | {
      response: null;
      error: string;
      refreshedToken?: string;
    };

export async function APICall(
  url: string,
  options: RequestInit = {},
): Promise<APIResponse> {
  const isServer = typeof window === "undefined";

  try {
    if (isServer) {
      const { cookies } = await import("next/headers");
      const { setCookie } = await import("@/app/api/auth/utils");
      const cookieStore = await cookies();
      let token = cookieStore.get("access_token")?.value;

      let lastRefreshedToken: string | undefined;
      const performServerRefresh = async () => {
        try {
          console.log("refreshing token via action");
          const { RefreshToken } =
            await import("@/lib/modules/auth/auth.actions");
          const result = await RefreshToken();

          if (result.access_token) {
            const newToken = result.access_token;
            lastRefreshedToken = newToken;
            try {
              await setCookie(cookieStore, newToken, "access_token");
            } catch {}

            return newToken;
          }
        } catch (e) {
          console.error("Refresh token error in APICall:", e);
        }
        return null;
      };

      if (!token) {
        const refreshedToken = await performServerRefresh();
        if (refreshedToken) token = refreshedToken;
      }

      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      // Injecting internal API code for internal APIs 
      if (url.includes("/internal/")) {
        headers["X-Internal-Code"] = env.INTERNAL_API_CODE;
      }

      if (token) {
        headers["Cookie"] = `access_token=${token}`;
      }

      let response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        const refreshedToken = await performServerRefresh();
        if (!refreshedToken) {
          return { response: null, error: "Failed token refresh" };
        }
        headers["Cookie"] = `access_token=${refreshedToken}`;
        response = await fetch(url, { ...options, headers });
      }
      if (!response.ok) {
        return {
          response: null,
          error: await parseServerError(response, "Failed to fetch"),
          refreshedToken: lastRefreshedToken,
        };
      }

      return {
        response: response,
        error: null,
        refreshedToken: lastRefreshedToken,
      };
    } else {
      // Rewrite backend URL to go through the same-origin proxy
      const backendUrl = env.NEXT_PUBLIC_BACKEND_API_URL;
      const proxiedUrl = url.startsWith(backendUrl)
        ? `/api${url.slice(backendUrl.length)}`
        : url;

      let response = await fetch(proxiedUrl, {
        credentials: "include",
        ...options,
      });

      if (response.status === 401) {
        const refreshed = await executeClientRefresh();
        if (refreshed) {
          response = await fetch(proxiedUrl, {
            credentials: "include",
            ...options,
          });
        }
      }
      if (!response.ok) {
        return {
          response: null,
          error: await parseServerError(response, "Failed to fetch"),
        };
      }
      return { response: response, error: null };
    }
  } catch (e) {
    console.log(e);
    return { response: null, error: "Failed to fetch" };
  }
}
