import { signIn, signOut, signUp } from "@/lib/actons/auth";
import { QUERY_KEYS } from "@/shared/query-keys";
import { AuthPayload } from "@/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: AuthPayload) =>
            data.mode === "signin"
                ? signIn(data.credentials)
                : signUp(data.credentials),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all });

            const isSignUp = variables.mode === "signup";
            toast.success(isSignUp ? "Account created! Welcome" : "Signed in successfully");
            router.push("/dashboard");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Authentication failed");
        },
    });
};

export const useSignOut = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            queryClient.clear();
            toast.success("Signed out");
            router.push("/signin");
            router.refresh();
        },
        onError: () => {
            toast.error("Sign out failed");
        },
    });
};
