import { apiFetch } from "@/lib/fetch";
import { BACKEND_API_URL } from "@/lib/config";
import { QUERY_KEYS } from "@/shared/query-keys";
import { UserFullInfo } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
    const query = useQuery<UserFullInfo | null>({
        queryKey: QUERY_KEYS.auth.me,
        queryFn: async () => {
            try {
                return await apiFetch<UserFullInfo>(`${BACKEND_API_URL}/v1/users/me`);
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
