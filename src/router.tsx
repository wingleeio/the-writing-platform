import { createRouter as createTanstackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

import "./styles.css";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuthFromProvider } from "@/hooks/useAuthFromProvider";
import { AuthKitProvider } from "@workos-inc/authkit-react";

export const createRouter = () => {
  const CONVEX_URL = String(import.meta.env.VITE_CONVEX_URL);
  const WORKOS_CLIENT_ID = String(import.meta.env.VITE_WORKOS_CLIENT_ID);

  if (!CONVEX_URL) {
    console.error("missing envar CONVEX_URL");
  }

  if (!WORKOS_CLIENT_ID) {
    console.error("missing envar WORKOS_CLIENT_ID");
  }

  const convexClient = new ConvexReactClient(CONVEX_URL);
  const convexQueryClient = new ConvexQueryClient(convexClient);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: {
      queryClient,
      convexClient,
      convexQueryClient,
    },
    Wrap(props) {
      return (
        <AuthKitProvider clientId={WORKOS_CLIENT_ID}>
          <ConvexProviderWithAuth
            client={convexClient}
            useAuth={useAuthFromProvider}
          >
            <QueryClientProvider client={queryClient}>
              {props.children}
            </QueryClientProvider>
          </ConvexProviderWithAuth>
        </AuthKitProvider>
      );
    },
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
