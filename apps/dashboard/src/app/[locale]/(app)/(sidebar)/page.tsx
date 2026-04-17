import type { Metadata } from "next";
import { OverviewView } from "@/components/widgets";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Overview | Quadra EDMS",
};

export default function Overview() {
  // Skip server-side prefetch to avoid hydration errors
  // The client will fetch the data on mount
  
  return (
    <HydrateClient>
      <OverviewView />
    </HydrateClient>
  );
}
