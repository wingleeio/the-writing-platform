import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";

import appCss from "@/styles.css?url";
import { Header } from "@/components/header";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { useAuthFromProvider } from "@/hooks/useAuthFromProvider";

const CONVEX_URL = String(import.meta.env.VITE_CONVEX_URL);
const WORKOS_CLIENT_ID = String(import.meta.env.VITE_WORKOS_CLIENT_ID);

if (!CONVEX_URL) {
  console.error("missing envar CONVEX_URL");
}

if (!WORKOS_CLIENT_ID) {
  console.error("missing envar WORKOS_CLIENT_ID");
}

const convexClient = new ConvexReactClient(CONVEX_URL);

export const Route = createRootRoute({
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
      <AuthKitProvider clientId={WORKOS_CLIENT_ID}>
        <ConvexProviderWithAuth
          client={convexClient}
          useAuth={useAuthFromProvider}
        >
          <div className="flex flex-col fixed inset-0 overflow-x-hidden overflow-y-auto">
            <Header />
            <Outlet />
          </div>
          {/* <TanStackRouterDevtools /> */}
        </ConvexProviderWithAuth>
      </AuthKitProvider>
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
