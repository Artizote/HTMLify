import { apiFetch } from "@/lib/fetch";
import { clientEnv } from "@/lib/env";
import { QUERY_KEYS } from "@/shared/query-keys";
import { UserFullInfo } from "@/lib/modules/user/user.types";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  const query = useQuery<UserFullInfo | null>({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      try {
        return await apiFetch<UserFullInfo>(
          `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/v1/users/me`,
        );
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
