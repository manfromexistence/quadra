import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { QuickActionsFAB } from "@/components/quick-actions-fab";
import { ScrollableContent } from "@/components/scrollable-content";
import { HydrateClient } from "@/trpc/server";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HydrateClient>
      <DashboardLayout>
        <ScrollableContent>
          {children}
          <QuickActionsFAB />
        </ScrollableContent>
      </DashboardLayout>
    </HydrateClient>
  );
}
