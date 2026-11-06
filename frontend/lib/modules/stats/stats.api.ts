import { env } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";


export async function getAllStats() {
  const { response, error } = await APICall(env.NEXT_PUBLIC_BACKEND_API_URL + "/v1/stats");
  if (error) return { data: null, error };
  return { data: (await response?.json()), error: null };
}

export async function getResourceStats(resource: string) {
  const { response, error } = await APICall(env.NEXT_PUBLIC_BACKEND_API_URL + "/v1/stats/" + resource);
  if (error) return { data: null, error };
  return { data: (await response?.json()), error: null };
}

