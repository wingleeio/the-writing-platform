import { getWorkOS } from "@/lib/workos";
import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  deleteCookie,
  setCookie,
} from "@tanstack/react-start/server";

export const withAuth = createServerFn({ method: "GET" }).handler(async () => {
  const cookie = getCookie("wos-session");
  if (!cookie) {
    return null;
  }

  const session = getWorkOS().userManagement.loadSealedSession({
    sessionData: cookie,
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
  });

  const auth = await session.authenticate();

  if (auth.authenticated) {
    return auth;
  }

  if (auth.reason === "no_session_cookie_provided") {
    return null;
  }

  const refresh = await session.refresh();

  if (!refresh.authenticated) {
    deleteCookie("wos-session");
    return null;
  }

  setCookie("wos-session", refresh.sealedSession!, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return session.authenticate();
});

export const getAccessToken = createServerFn({ method: "GET" }).handler(
  async () => {
    const auth = await withAuth();

    if (!auth) {
      return null;
    }

    if (!auth.authenticated) {
      return null;
    }

    return auth.accessToken;
  }
);
