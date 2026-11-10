import { APICall } from "lib/fetch/api"
import { env } from "lib/env"


type UserDashboardStats = {
  file: { count: number }
  pen: { count: number }
}

type UserDashboardLatestModefies = {
    type: string
    id: string
    title: string
    path: string
    url: string
    modified: Date
}


export async function getUserDashboardStats(username: string): Promise<UserDashboardStats> {
  const { response, error } = await APICall(env.NEXT_PUBLIC_BACKEND_API_URL + `/internal/dashboard/${username}/stats`);
  if (error || !response) {
    return {
      file: { count: 0 },
      pen: { count: 0}
    };
  }
  return await response.json() as UserDashboardStats;
}

export async function getUserDashboardLatestModefiesItems(username: string): Promise<UserDashboardLatestModefies[]> {
  const { response, error } = await APICall(env.NEXT_PUBLIC_BACKEND_API_URL + `/internal/dashboard/${username}/latest-modified`);
  if (error || !response) {
    return [];
  }
  let recents = await response.json() as UserDashboardLatestModefies[];
  recents = recents.map((item) => ({
    ...item,
    title: item.title || item.path.split("/").filter(Boolean).pop() || "Untitled",
  }));
  return recents;
}

