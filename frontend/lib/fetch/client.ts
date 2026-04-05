let refreshPromise: Promise<boolean> | null = null;

async function refreshToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`/api/auth/refresh`, {
    method: "GET",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
async function APICall(url: string, options: RequestInit = {}) {
  return await fetch(url, {
    credentials: "include",
    ...options,
  });
}

export async function ClientAPICall(url: string, options: RequestInit = {}) {
  const response = await APICall(url, options);
  if (response.status == 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return await APICall(url, options);
    }
  }
  return response;
}
