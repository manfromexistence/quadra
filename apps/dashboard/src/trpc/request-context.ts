import { getLocationHeaders } from "@midday/location";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { Cookies } from "@/utils/constants";
import { getRequestTraceHeaders } from "@/utils/request-trace";
import { auth } from "@/lib/auth";

export const getServerRequestContext = cache(async () => {
  const [cookieStore, headersList] = await Promise.all([
    cookies(),
    headers(),
  ]);

  // Get Better Auth session
  const betterAuthSession = await auth.api.getSession({
    headers: headersList,
  });

  // Convert Better Auth session to tRPC-compatible format
  const session = betterAuthSession
    ? { 
        access_token: betterAuthSession.session.token,
        user: betterAuthSession.user 
      }
    : null;

  return {
    session,
    cookieStore,
    location: getLocationHeaders(headersList),
    traceHeaders: getRequestTraceHeaders(headersList),
  };
});

export function buildTRPCRequestHeaders(opts: {
  session?: { access_token?: string | null; user?: any } | null;
  forcePrimary?: boolean;
  location: ReturnType<typeof getLocationHeaders>;
  traceHeaders: ReturnType<typeof getRequestTraceHeaders>;
}) {
  const requestHeaders: Record<string, string> = {
    "x-user-timezone": opts.location.timezone,
    "x-user-locale": opts.location.locale,
    "x-user-country": opts.location.country,
    "x-request-id": opts.traceHeaders.requestId,
  };

  const accessToken = opts.session?.access_token;
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  // Pass user ID for Better Auth
  if (opts.session?.user?.id) {
    requestHeaders["x-user-id"] = opts.session.user.id;
  }

  if (opts.traceHeaders.cfRay) {
    requestHeaders["cf-ray"] = opts.traceHeaders.cfRay;
  }

  if (opts.forcePrimary) {
    requestHeaders["x-force-primary"] = "true";
  }

  return requestHeaders;
}

export function getForcePrimaryFromCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return cookieStore.get(Cookies.ForcePrimary)?.value === "true";
}
