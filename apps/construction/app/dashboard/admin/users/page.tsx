import { asc } from "drizzle-orm";
import { AdminUsersTable } from "@/components/edms/admin-users-table";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function AdminUsersPage() {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (sessionUser.role !== "admin") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        <EdmsPageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Users" },
          ]}
          title="Admin access required"
          description="Only administrators can review system-wide user records."
        />
      </div>
    );
  }

  const users = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      organization: userTable.organization,
      jobTitle: userTable.jobTitle,
      phone: userTable.phone,
      department: userTable.department,
      isActive: userTable.isActive,
    })
    .from(userTable)
    .orderBy(asc(userTable.name));

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/dashboard/admin" },
          { label: "Users" },
        ]}
        title="Workspace users"
        description="Manage workspace users, permissions, activation, and bulk administration from one control surface."
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
        <AdminUsersTable users={users} currentAdminId={sessionUser.id} />
      </div>
    </div>
  );
}
