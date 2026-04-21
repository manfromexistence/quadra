import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

function isUnauthorizedError(error: Error): boolean {
  if ("data" in error && typeof (error as any).data?.code === "string") {
    return (error as any).data.code === "UNAUTHORIZED";
  }
  return false;
}

export function makeQueryClient() {
  return new QueryClient({
    queryCache: isServer
      ? undefined
      : new QueryCache({
          onError: (error) => {
            if (isUnauthorizedError(error)) {
              window.location.href = "/login";
            }
          },
        }),
    defaultOptions: {
      queries: {
        // Optimized caching strategies
        staleTime: 30 * 1000, // 30 seconds default for dynamic data
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
        refetchOnWindowFocus: false, // Prevent unnecessary refetches on focus
        refetchOnReconnect: true, // Refetch on reconnect
        refetchOnMount: false, // Don't refetch on mount if data is fresh
        retry: isServer
          ? false
          : (failureCount, error) => {
              if (isUnauthorizedError(error)) return false;
              return failureCount < 2;
            },
      },
      mutations: {
        retry: 1, // Retry mutations once on failure
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
