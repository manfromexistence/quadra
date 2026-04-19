import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

const SUPPORTED_LOCALES = new Set(["en"]);

const I18nMiddleware = createI18nMiddleware({
  locales: ["en"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

export async function proxy(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // Skip proxy for static assets completely
  if (
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.match(
      /\.(png|jpe?g|gif|svg|webp|ico|webmanifest|txt)$/i,
    )
  ) {
    return NextResponse.next();
  }

  // CRITICAL: Skip i18n rewriting for API routes (tRPC, auth, etc.)
  // Without this, API calls get rewritten through the i18n system and return HTML
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const response = I18nMiddleware(request);

  // Check if user is authenticated by checking for session cookie
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie?.value;

  const nextUrl = request.nextUrl;
  const pathnameSegments = nextUrl.pathname.split("/").filter(Boolean);
  const pathnameLocale = pathnameSegments[0];
  const hasLocalePrefix = pathnameLocale
    ? SUPPORTED_LOCALES.has(pathnameLocale)
    : false;
  const pathnameWithoutLocale = hasLocalePrefix
    ? `/${pathnameSegments.slice(1).join("/")}` || "/"
    : nextUrl.pathname;

  const newUrl = new URL(pathnameWithoutLocale || "/", origin);

  const encodedPathname =
    newUrl.pathname === "/" ? "" : newUrl.pathname.substring(1);
  const encodedSearchParams = `${encodedPathname}${nextUrl.search}`;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/i/",
    "/p/",
    "/s/",
    "/r/",
    "/verify",
    "/oauth-callback",
    "/desktop/search",
    "/auth/reset-password",
    "/api/auth",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    newUrl.pathname.includes(route),
  );

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute && newUrl.pathname !== "/login") {
    const loginPath = hasLocalePrefix
      ? `/${pathnameLocale}/login`
      : "/en/login";
    const loginUrl = new URL(loginPath, origin);

    if (encodedSearchParams) {
      loginUrl.searchParams.append("return_to", encodedSearchParams);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated) {
    if (newUrl.pathname !== "/onboarding" && newUrl.pathname !== "/teams") {
      const inviteCodeMatch = newUrl.pathname.startsWith("/teams/invite/");

      if (inviteCodeMatch) {
        return NextResponse.redirect(`${origin}${request.nextUrl.pathname}`);
      }
    }
  }

  return response;
}
