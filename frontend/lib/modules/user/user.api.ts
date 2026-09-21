import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";

export interface APIKeyResponse {
  api_key: string;
}

async function getApiKey() {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me/api-key`,
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to get API key" };
  }
  return {
    data: (await response.json()) as APIKeyResponse,
    error: null,
  };
}

async function revokeApiKey() {
  const { response, error } = await APICall(
    `${env.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me/revoke-api-key`,
    {
      method: "POST",
    },
  );
  if (error || !response) {
    return { data: null, error: error || "Failed to revoke API key" };
  }
  return {
    data: (await response.json()) as APIKeyResponse,
    error: null,
  };
}

export { getApiKey, revokeApiKey };
