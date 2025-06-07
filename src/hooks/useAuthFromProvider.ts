import { useAuth } from "@workos-inc/authkit-react";
import { useCallback, useMemo } from "react";

export function useAuthFromProvider() {
  const workos = useAuth();

  const fetchAccessToken = useCallback(
    async (args: { forceRefreshToken?: boolean }) => {
      const accessToken = await workos.getAccessToken({
        forceRefresh: args.forceRefreshToken,
      });

      return accessToken;
    },
    [workos.getAccessToken]
  );

  return useMemo(
    () => ({
      isLoading: workos.isLoading,
      isAuthenticated: Boolean(workos.user),
      fetchAccessToken,
    }),
    [fetchAccessToken, workos.isLoading, workos.user]
  );
}
