"use client";

import { useQuery } from "@tanstack/react-query";
import type { EdmsDashboardData } from "@/lib/edms/dashboard";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json() as Promise<EdmsDashboardData>;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for SPA feel
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}
