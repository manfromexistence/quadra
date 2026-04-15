import { HydrateClient } from "@/trpc/server";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HydrateClient>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </HydrateClient>
  );
}
