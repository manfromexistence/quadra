import { db } from "@/db";
import { auth } from "@/lib/auth";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export async function createContext(opts: FetchCreateContextFnOptions) {
  try {
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });

    console.log("[tRPC Context] Session:", session ? `User: ${session.user?.email}` : "No session");

    return {
      db,
      session,
      userId: session?.user?.id,
      teamId: "team_1", // Default team for mock data
    };
  } catch (error) {
    console.error("[tRPC Context] Error getting session:", error);
    return {
      db,
      session: null,
      userId: undefined,
      teamId: "team_1",
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
