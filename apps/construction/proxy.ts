import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { API_AUTH_PREFIX, DEFAULT_LOGIN_REDIRECT } from "./routes";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const pathname = request.nextUrl.pathname;

  const isApiAuth = pathname.startsWith(API_AUTH_PREFIX);

  if (isApiAuth) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  if (pathname === "/settings") {
    return NextResponse.redirect(new URL("/settings/account", request.url));
  }

  const profile = await getEdmsProfile(String(session.user.id));

  if (pathname.startsWith("/dashboard") && isEdmsProfileIncomplete(profile)) {
    return NextResponse.redirect(new URL("/settings/account?onboarding=1", request.url));
  }

  return NextResponse.next();
}

async function getEdmsProfile(userId: string) {
  const profileRows = await db
    .select({
      role: userTable.role,
      organization: userTable.organization,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  const [profile] = profileRows;

  return {
    role: typeof profile?.role === "string" ? profile.role : "user",
    organization: typeof profile?.organization === "string" ? profile.organization : "",
  };
}

function isEdmsProfileIncomplete(profile: { role: string; organization: string }) {
  return profile.role === "user" || profile.organization.trim().length === 0;
}

export const config = {
  matcher: ["/editor/theme/:path*", "/dashboard/:path*", "/settings/:path*", "/success"],
};
