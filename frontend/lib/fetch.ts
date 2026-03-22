import { BACKEND_API_URL } from "@/lib/config";
import { extractErrorMessage } from "@/lib/utils";
import { getAccessToken } from "@/lib/actons/user";

let isRefreshing = false;
let refreshQueue: ((ok: boolean) => void)[] = [];
let cachedClientToken: string | null = null;
const isClient = typeof window !== "undefined";

async function tryRefresh(): Promise<boolean> {
    if (isRefreshing) {
        return new Promise((resolve) => refreshQueue.push(resolve));
    }

    isRefreshing = true;
    try {
        const res = await fetch(`${BACKEND_API_URL}/v1/auth/refresh`, {
            method: "GET",
            credentials: "include",
        });
        const ok = res.ok;
        if (ok) {
            cachedClientToken = null;
        }
        refreshQueue.forEach((cb) => cb(ok));
        refreshQueue = [];
        return ok;
    } catch {
        refreshQueue.forEach((cb) => cb(false));
        refreshQueue = [];
        return false;
    } finally {
        isRefreshing = false;
    }
}

export async function fetchWithAuth(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    const headers = new Headers(init.headers || {});

    let token: string | null = null;
    try {
        if (isClient) {
            if (!cachedClientToken) {
                cachedClientToken = await getAccessToken();
            }
            token = cachedClientToken;
        } else {
            token = await getAccessToken();
        }
    } catch {

    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const opts: RequestInit = { ...init, credentials: "include", headers };
    let response = await fetch(input, opts);

    if (response.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            try {
                if (isClient) {
                    cachedClientToken = await getAccessToken();
                    token = cachedClientToken;
                } else {
                    token = await getAccessToken();
                }
            } catch {
                token = null;
            }

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
                opts.headers = headers;
            }

            response = await fetch(input, opts);
        }
    }

    return response;
}

export async function apiFetch<T>(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<T> {
    let response: Response;
    try {
        response = await fetchWithAuth(input, init);
    } catch (err) {
        throw new Error(await extractErrorMessage(err));
    }

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    return response.json() as Promise<T>;
}
