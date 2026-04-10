import { useQuery } from "@tanstack/react-query";

import { clientEnv } from "@/lib/env";
import { APICall } from "@/lib/fetch/api";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { QUERY_KEYS } from "@/shared/query-keys";

export function useCurrentUser() {
  const query = useQuery<UserFullInfo | null>({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      try {
        const res = await APICall(
          `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`,
        );
        if (!res.ok) return null;
        return res.json() as Promise<UserFullInfo>;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: query.data != null,
  };
}
