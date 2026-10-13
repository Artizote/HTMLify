import { parseServerError } from "@/lib/errors";
import { useTokenStore } from "@/lib/stores/token.store";

let clientRefreshPromise: Promise<boolean> | null = null;

async function executeClientRefresh() {
  if (clientRefreshPromise) return clientRefreshPromise;

  clientRefreshPromise = fetch(`/api/auth/refresh`, {
    method: "GET",
    credentials: "include",
  })
    .then(async (r) => {
      if (!r.ok) return false;

      const data = (await r.json()) as { access_token?: string };
      if (!data.access_token) return false;

      useTokenStore.getState().setAccessToken(data.access_token);
      return true;
    })
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
      const buildHeaders = () => {
        return {
          ...options.headers,
          Authorization: `Bearer ${useTokenStore.getState().accessToken}`,
        };
      };

      let response = await fetch(url, {
        ...options,
        headers: buildHeaders(),
      });

      if (response.status === 401) {
        const refreshed = await executeClientRefresh();
        if (refreshed) {
          response = await fetch(url, {
            ...options,
            headers: buildHeaders(),
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
