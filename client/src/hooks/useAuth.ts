import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useAuth() {
  const { data, isLoading } = useQuery({ queryKey: AUTH_QUERY_KEY, queryFn: authApi.me });
  return { user: data?.user ?? null, isLoading };
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
  });
}
