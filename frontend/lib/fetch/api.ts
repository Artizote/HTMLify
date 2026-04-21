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

export async function APICall(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const isServer = typeof window === "undefined";

  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value;

    const performServerRefresh = async () => {
      const refreshTokenValue = cookieStore.get("refresh_token")?.value;
      if (!refreshTokenValue) return null;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/v1/auth/refresh`,
          { headers: { Cookie: `refresh_token=${refreshTokenValue}` } },
        );
        if (res.ok) {
          const data = await res.json();
          return data.access_token;
        }
      } catch (e) {
        console.error(e);
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
        return new Response(JSON.stringify({ error: "Failed token refresh" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      headers["Cookie"] = `access_token=${refreshedToken}`;
      response = await fetch(url, { ...options, headers });
    }
    return response;
  } else {
    console.log("this is client");
    let response = await fetch(url, {
      credentials: "include",
      ...options,
    });

    if (response.status === 401) {
      const refreshed = await executeClientRefresh();
      if (refreshed) {
        response = await fetch(url, {
          credentials: "include",
          ...options,
        });
      }
    }
    return response;
  }
}
