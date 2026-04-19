import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function createContext(opts: FetchCreateContextFnOptions) {
  try {
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });

    return {
      db,
      session,
      userId: session?.user?.id,
      teamId: "team_1", // Default team for mock data
    };
  } catch {
    return {
      db,
      session: null,
      userId: undefined,
      teamId: "team_1",
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
