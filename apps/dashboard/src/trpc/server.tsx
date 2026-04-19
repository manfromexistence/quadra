import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import superjson from "superjson";
import type { AppRouter } from "@/app/api/trpc/[trpc]/router";
import { makeQueryClient } from "./query-client";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

// Get the base URL for server-side tRPC calls
// In development, use localhost. In production, use the actual URL.
function getServerBaseUrl() {
  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    // Use localhost with the port from environment or default to 3001
    const port = process.env.PORT || "3001";
    return `http://localhost:${port}`;
  }

  // In production, use relative URL for same-origin requests
  // This is more efficient and avoids external HTTP calls
  return "";
}

export const trpc = createTRPCOptionsProxy<AppRouter>({
  queryClient: getQueryClient,
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getServerBaseUrl()}/api/trpc`,
        headers() {
          return {
            "x-trpc-source": "server",
          };
        },
        fetch(url, options) {
          console.log("[tRPC Server] Fetching:", url);
          return fetch(url, {
            ...options,
            next: { revalidate: 0 },
          }).then((res) => {
            if (!res.ok) {
              console.error(
                "[tRPC Server] HTTP Error:",
                res.status,
                res.statusText,
              );
            }
            return res;
          });
        },
      }),
    ],
  }),
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any).catch(() => {
      // Avoid unhandled promise rejections from fire-and-forget prefetches.
    });
  } else {
    void queryClient.prefetchQuery(queryOptions).catch(() => {
      // Avoid unhandled promise rejections from fire-and-forget prefetches.
    });
  }
}

export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptionsArray: T[],
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      void queryClient.prefetchInfiniteQuery(queryOptions as any).catch(() => {
        // Avoid unhandled promise rejections from fire-and-forget prefetches.
      });
    } else {
      void queryClient.prefetchQuery(queryOptions).catch(() => {
        // Avoid unhandled promise rejections from fire-and-forget prefetches.
      });
    }
  }
}

/**
 * Get a tRPC client for server-side API routes
 * Use this when you need to call mutations from API routes (e.g., webhooks, callbacks)
 * For queries, use the `trpc` proxy with `queryOptions` instead
 *
 * @param options.forcePrimary - Force all reads to use the primary database,
 *   bypassing replicas. Use this in auth callbacks and other flows where
 *   read-after-write consistency is critical (e.g., reading a user that was
 *   just created). This is more reliable than depending on the cookie alone.
 */
export async function getTRPCClient(options?: { forcePrimary?: boolean }) {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getServerBaseUrl()}/api/trpc`,
        headers() {
          return {
            "x-trpc-source": "server-client",
          };
        },
      }),
    ],
  });
}
