"use client";

import { useQuery } from "@tanstack/react-query";
import type { DocumentControlData } from "@/lib/edms/documents";

interface DocumentFilters {
  query?: string;
  status?: string;
  discipline?: string;
  revision?: string;
}

export function useDocumentsData(filters: DocumentFilters = {}) {
  const searchParams = new URLSearchParams();
  if (filters.query) searchParams.set("query", filters.query);
  if (filters.status) searchParams.set("status", filters.status);
  if (filters.discipline) searchParams.set("discipline", filters.discipline);
  if (filters.revision) searchParams.set("revision", filters.revision);

  const queryString = searchParams.toString();
  const url = `/api/dashboard/documents${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch documents data");
      }
      return response.json() as Promise<DocumentControlData>;
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
