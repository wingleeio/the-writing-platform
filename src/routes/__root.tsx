import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import appCss from "@/styles.css?url";
import { Header } from "@/components/header";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ConvexReactClient } from "convex/react";

interface RootContext {
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
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: () => (
    <RootDocument>
      <Header />
      <Outlet />
    </RootDocument>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
