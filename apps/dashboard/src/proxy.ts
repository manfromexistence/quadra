import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

const ORIGIN = process.env.NEXT_PUBLIC_URL || "http://localhost:3001";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

export async function proxy(request: NextRequest) {
  // Skip middleware for static assets completely
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  const response = I18nMiddleware(request);
  
  // Check if user is authenticated by checking for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie;

  const nextUrl = request.nextUrl;

  const pathnameLocale = nextUrl.pathname.split("/", 2)?.[1];

  const pathnameWithoutLocale = pathnameLocale
    ? nextUrl.pathname.slice(pathnameLocale.length + 1)
    : nextUrl.pathname;

  const newUrl = new URL(pathnameWithoutLocale || "/", ORIGIN);

  const encodedSearchParams = `${newUrl?.pathname?.substring(1)}${
    newUrl.search
  }`;

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
    newUrl.pathname.includes(route)
  );

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute && newUrl.pathname !== "/login") {
    const loginUrl = new URL("/login", ORIGIN);

    if (encodedSearchParams) {
      loginUrl.searchParams.append("return_to", encodedSearchParams);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated) {
    if (newUrl.pathname !== "/onboarding" && newUrl.pathname !== "/teams") {
      const inviteCodeMatch = newUrl.pathname.startsWith("/teams/invite/");

      if (inviteCodeMatch) {
        return NextResponse.redirect(`${ORIGIN}${request.nextUrl.pathname}`);
      }
    }
  }

  return response;
}
