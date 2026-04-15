"use client";

import { type QueryClient } from "@tanstack/react-query";

export function prefetchDashboard(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Failed to prefetch dashboard");
      return response.json();
    },
    staleTime: 30000,
  });
}

export function prefetchDocuments(queryClient: QueryClient, filters: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(filters);
  const queryString = searchParams.toString();
  const url = `/api/dashboard/documents${queryString ? `?${queryString}` : ""}`;

  return queryClient.prefetchQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to prefetch documents");
      return response.json();
    },
    staleTime: 30000,
  });
}
