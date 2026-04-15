import { EdmsDashboardShell } from "@/components/edms/dashboard-shell";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getRequiredDashboardSessionUser();

  return (
    <EdmsDashboardShell
      user={{
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.image,
        role: sessionUser.role,
        organization: sessionUser.organization,
      }}
    >
      {children}
    </EdmsDashboardShell>
  );
}
