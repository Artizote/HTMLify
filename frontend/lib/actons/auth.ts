import { BACKEND_API_URL } from "@/lib/config";
import { extractErrorMessage, zodToFormData } from "@/lib/utils";
import { LoginSchema, SignUpSchema } from "@/shared/types";


export const refreshToken = async (): Promise<boolean> => {
    try {
        const res = await fetch(`${BACKEND_API_URL}/v1/auth/refresh`, {
            method: "GET",
            credentials: "include",
        });
        return res.ok;
    } catch {
        return false;
    }
};


export const refreshTokenFromCookie = async (refreshToken: string): Promise<string | null> => {
    try {
        const res = await fetch(`${BACKEND_API_URL}/v1/auth/refresh`, {
            method: "GET",
            headers: { Cookie: `refresh_token=${refreshToken}` },
            cache: "no-store",
        });
        if (!res.ok) return null;

        const setCookie = res.headers.get("set-cookie");
        if (!setCookie) return null;

        const match = setCookie.match(/access_token=([^;]+)/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
};


export const signOut = async (): Promise<void> => {
    await fetch(`${BACKEND_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
};


export const signIn = async (data: LoginSchema) => {
    const formData = zodToFormData(data);
    formData.append("grant_type", "password");

    let response: Response;

    try {
        response = await fetch(`${BACKEND_API_URL}/v1/auth/token`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
    } catch (error) {
        throw new Error(await extractErrorMessage(error));
    }

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    return response.json();
};
export const signUp = async (data: SignUpSchema) => {
    let response: Response;

    try {
        response = await fetch(`${BACKEND_API_URL}/v1/users`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        throw new Error(await extractErrorMessage(error));
    }

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    return response.json();
};