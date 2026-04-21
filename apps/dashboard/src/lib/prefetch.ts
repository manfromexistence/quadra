"use client";

import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/app/api/trpc/[trpc]/router";

/**
 * Prefetch tRPC queries for better performance
 * Call this in parent components or layout to prefetch data before navigation
 */
export function prefetchQuery(
  queryClient: QueryClient,
  path: keyof AppRouter["_def"]["procedures"],
  input?: any,
) {
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: "/api/trpc",
      }),
    ],
  });

  queryClient.prefetchQuery({
    queryKey: [path, input],
    queryFn: () => client[path].query(input),
  });
}

/**
 * Hook to prefetch multiple queries at once
 */
export function usePrefetchQueries() {
  const queryClient = useQueryClient();

  const prefetchAll = async () => {
    // Prefetch commonly accessed data
    prefetchQuery(queryClient, "edmsDocuments.list");
    prefetchQuery(queryClient, "transmittals.list");
  };

  return { prefetchAll };
}
