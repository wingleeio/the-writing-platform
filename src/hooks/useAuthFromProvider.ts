import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getAccessToken } from "@/lib/auth";
import type { RootContext } from "@/routes/__root";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export async function ensureAuth(context: RootContext) {
  await context.queryClient.ensureQueryData({
    queryKey: ["access-token"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return accessToken;
    },
  });
}

export function useAuthFromProvider() {
  const query = useQuery({
    queryKey: ["access-token"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return accessToken;
    },
  });

  const fetchAccessToken = useCallback(async () => {
    return getAccessToken();
  }, []);

  return useMemo(
    () => ({
      isLoading: query.isLoading,
      isAuthenticated: Boolean(query.data),
      fetchAccessToken,
    }),
    [fetchAccessToken, query.data, query.isLoading]
  );
}
