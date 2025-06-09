import type { RootContext } from "@/routes/__root";
import { getAccessToken } from "@/lib/auth";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useQuery } from "@tanstack/react-query";

export async function ensureCurrentUser(context: RootContext) {
  const accessToken = await getAccessToken();

  if (accessToken) {
    context.convexQueryClient.serverHttpClient?.setAuth(accessToken);
    context.queryClient.ensureQueryData(convexQuery(api.users.getCurrent, {}));
  }
}

export function useCurrentUser() {
  return useQuery(convexQuery(api.users.getCurrent, {}));
}
