import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HydrateClient } from "@/trpc/server";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HydrateClient>
      <DashboardLayout>{children}</DashboardLayout>
    </HydrateClient>
  );
}
