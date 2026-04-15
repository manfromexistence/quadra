"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type ComponentProps } from "react";
import { prefetchDashboard, prefetchDocuments } from "@/lib/prefetch-utils";

interface PrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetchRoute?: "dashboard" | "documents" | "projects" | "workflows";
}

export function PrefetchLink({ prefetchRoute, children, ...props }: PrefetchLinkProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    if (!prefetchRoute) return;

    switch (prefetchRoute) {
      case "dashboard":
        prefetchDashboard(queryClient);
        break;
      case "documents":
        prefetchDocuments(queryClient);
        break;
      // Add more routes as needed
    }
  };

  return (
    <Link {...props} onMouseEnter={handleMouseEnter} prefetch={true}>
      {children}
    </Link>
  );
}
