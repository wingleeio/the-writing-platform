import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from "@tanstack/react-router";
import appCss from "@/styles.css?url";
import { Header } from "@/components/header";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ConvexProviderWithAuth, type ConvexReactClient } from "convex/react";
import { ensureCurrentUser } from "@/hooks/useCurrentUser";
import { ensureAuth, useAuthFromProvider } from "@/hooks/useAuthFromProvider";
export interface RootContext {
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}

export const Route = createRootRouteWithContext<RootContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "The Writing Platform",
      },
      {
        property: "og:title",
        content: "The Writing Platform",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:description",
        content:
          "A platform for writers to share their stories and connect with readers.",
      },
      {
        property: "og:site_name",
        content: "The Writing Platform",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  loader: async ({ context }) => {
    await ensureAuth(context);
    await ensureCurrentUser(context);
  },
  component: () => {
    const context = useRouteContext({ from: "__root__" });
    return (
      <RootDocument>
        <QueryClientProvider client={context.queryClient}>
          <ConvexProviderWithAuth
            client={context.convexClient}
            useAuth={useAuthFromProvider}
          >
            <Header />
            <Outlet />
          </ConvexProviderWithAuth>
        </QueryClientProvider>
      </RootDocument>
    );
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark flex flex-col min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
