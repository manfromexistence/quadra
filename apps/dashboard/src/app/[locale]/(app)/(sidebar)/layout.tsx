import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { QuickActionsFAB } from "@/components/quick-actions-fab";
import { ScrollableContent } from "@/components/scrollable-content";
import { auth } from "@/lib/auth";
import { HydrateClient } from "@/trpc/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <DashboardLayout>
        <ScrollableContent>
          {children}
        </ScrollableContent>
        <QuickActionsFAB />
      </DashboardLayout>
    </HydrateClient>
  );
}
