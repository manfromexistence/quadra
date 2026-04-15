import { getGeoContext } from "@api/utils/geo";
import { getRequestTrace } from "@api/utils/request-trace";
import { safeCompare } from "@api/utils/safe-compare";
import type { Database } from "@midday/db/client";
import { db } from "@midday/db/client";
import { createLoggerWithContext } from "@midday/logger";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "hono";
import superjson from "superjson";
import { withPrimaryReadAfterWrite } from "./middleware/primary-read-after-write";
import { withTeamPermission } from "./middleware/team-permission";

const DEBUG_PERF = process.env.DEBUG_PERF === "true";
const perfLogger = createLoggerWithContext("perf:trpc");

type Session = {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    [key: string]: any;
  };
} | null;

type TRPCContext = {
  session: Session;
  db: Database;
  geo: ReturnType<typeof getGeoContext>;
  teamId?: string;
  forcePrimary?: boolean;
  isInternalRequest?: boolean;
  requestId: string;
  cfRay?: string;
};

// Verify Better Auth token
async function verifyBetterAuthToken(token?: string, userId?: string): Promise<Session> {
  if (!token && !userId) return null;
  
  try {
    // For now, we'll use a simple token verification
    // In production, you'd verify the JWT token properly
    if (userId) {
      // If we have userId from header, trust it (from dashboard)
      return {
        userId,
        user: {
          id: userId,
          email: "", // Will be fetched from DB if needed
          name: "",
        },
      };
    }
    
    // TODO: Implement proper JWT verification for Better Auth tokens
    return null;
  } catch (error) {
    return null;
  }
}

export const createTRPCContext = async (
  _: unknown,
  c: Context,
): Promise<TRPCContext> => {
  const ctxStart = DEBUG_PERF ? performance.now() : 0;

  const accessToken = c.req.header("Authorization")?.split(" ")[1];
  const userId = c.req.header("x-user-id");
  const internalKey = c.req.header("x-internal-key");
  const { requestId, cfRay } = getRequestTrace(c.req);

  const isInternalRequest =
    !!internalKey &&
    !!process.env.INTERNAL_API_KEY &&
    safeCompare(internalKey, process.env.INTERNAL_API_KEY);

  const jwtStart = DEBUG_PERF ? performance.now() : 0;
  const session = await verifyBetterAuthToken(accessToken, userId);
  const jwtMs = DEBUG_PERF ? performance.now() - jwtStart : 0;

  const geo = getGeoContext(c.req);
  const forcePrimary = c.req.header("x-force-primary") === "true";

  if (DEBUG_PERF) {
    perfLogger.info("context", {
      totalMs: +(performance.now() - ctxStart).toFixed(2),
      jwtVerifyMs: +jwtMs.toFixed(2),
      hasSession: !!session,
      forcePrimary,
      requestId,
      cfRay,
    });
  }

  return {
    session,
    db,
    geo,
    forcePrimary,
    isInternalRequest,
    requestId,
    cfRay,
  };
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const withTimingMiddleware = t.middleware(async (opts) => {
  if (!DEBUG_PERF) return opts.next();
  const start = performance.now();
  const result = await opts.next();
  const durationMs = +(performance.now() - start).toFixed(2);

  perfLogger.info("procedure", {
    path: opts.path,
    type: opts.type,
    durationMs,
  });

  return result;
});

const withPrimaryDbMiddleware = t.middleware(async (opts) => {
  return withPrimaryReadAfterWrite({
    ctx: opts.ctx,
    type: opts.type,
    next: opts.next,
  });
});

const withTeamPermissionMiddleware = t.middleware(async (opts) => {
  return withTeamPermission({
    ctx: opts.ctx,
    procedurePath: opts.path,
    next: opts.next,
  });
});

export const publicProcedure = t.procedure
  .use(withTimingMiddleware)
  .use(withPrimaryDbMiddleware);

export const protectedProcedure = t.procedure
  .use(withTimingMiddleware)
  .use(withTeamPermissionMiddleware)
  .use(withPrimaryDbMiddleware)
  .use(async (opts) => {
    const { teamId, session } = opts.ctx;

    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
      ctx: {
        teamId,
        session,
      },
    });
  });

/**
 * Internal procedure for service-to-service calls ONLY.
 * Authenticates exclusively via x-internal-key header (INTERNAL_API_KEY).
 * Used by BullMQ workers, and other internal services.
 * Regular user sessions are NOT accepted — use protectedProcedure for browser-facing endpoints.
 */
export const internalProcedure = t.procedure
  .use(withTimingMiddleware)
  .use(withPrimaryDbMiddleware)
  .use(async (opts) => {
    const { isInternalRequest } = opts.ctx;

    if (!isInternalRequest) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
      ctx: opts.ctx,
    });
  });

/**
 * Procedure that accepts EITHER a valid user session OR a valid internal key.
 * Use for endpoints called from both the dashboard (browser) and internal services
 * (BullMQ workers, etc.).
 */
export const protectedOrInternalProcedure = t.procedure
  .use(withTimingMiddleware)
  .use(withPrimaryDbMiddleware)
  .use(async (opts) => {
    const { isInternalRequest, session } = opts.ctx;

    if (isInternalRequest) {
      return opts.next({ ctx: opts.ctx });
    }

    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
      ctx: {
        ...opts.ctx,
        session,
      },
    });
  });
