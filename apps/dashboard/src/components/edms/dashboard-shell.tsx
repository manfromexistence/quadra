import { SidebarInset, SidebarProvider } from "@midday/ui/sidebar";
import type { DashboardUser } from "@/lib/edms/dashboard";
import { EdmsDashboardSidebar } from "./dashboard-sidebar";

export function EdmsDashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <EdmsDashboardSidebar user={user} />
      <SidebarInset className="bg-background">
        <div className="flex min-h-screen flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
