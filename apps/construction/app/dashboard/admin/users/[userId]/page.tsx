import { format } from "date-fns";
import { Activity, ArrowLeft, Building2, FileStack, FolderKanban, Workflow } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserEditSheet } from "@/components/edms/admin-user-edit-sheet";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminUserDetailData } from "@/lib/edms/admin-user-detail";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (sessionUser.role !== "admin") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        <EdmsPageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Users", href: "/dashboard/admin/users" },
            { label: "Profile" },
          ]}
          title="Admin access required"
          description="Only administrators can review user activity and profile details."
        />
      </div>
    );
  }

  const { userId } = await params;
  const data = await getAdminUserDetailData(userId);

  if (!data) {
    notFound();
  }

  const user = data.profile;

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/dashboard/admin" },
          { label: "Users", href: "/dashboard/admin/users" },
          { label: user.name },
        ]}
        title={user.name}
        description="Profile details, EDMS activity, memberships, and uploaded document records."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/admin/users">
                <ArrowLeft className="size-4" />
                Back to users
              </Link>
            </Button>
            <AdminUserEditSheet user={user} currentAdminId={sessionUser.id} />
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={FileStack}
            label="Documents"
            value={data.stats.documentsUploaded}
            description="Documents uploaded"
          />
          <MetricCard
            icon={Workflow}
            label="Workflows"
            value={data.stats.workflowsCreated}
            description="Workflows created"
          />
          <MetricCard
            icon={FolderKanban}
            label="Projects"
            value={data.stats.projectsAssigned}
            description="Project memberships"
          />
          <MetricCard
            icon={Activity}
            label="Activity"
            value={data.stats.activityEntries}
            description="Logged activity entries"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          <Card>
            <CardHeader>
              <CardTitle>User profile</CardTitle>
              <CardDescription>Workspace identity and onboarding metadata.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="Role" value={formatEdmsLabel(user.role)} />
              <ProfileRow
                label="Status"
                value={<EdmsStatusBadge status={user.isActive ? "active" : "archived"} />}
              />
              <ProfileRow label="Organization" value={user.organization || "Unassigned"} />
              <ProfileRow label="Job title" value={user.jobTitle || "Unassigned"} />
              <ProfileRow label="Department" value={user.department || "Unassigned"} />
              <ProfileRow label="Phone" value={user.phone || "Unassigned"} />
              <ProfileRow
                label="Created"
                value={user.createdAt ? format(user.createdAt, "dd MMM yyyy") : "Unknown"}
              />
              <ProfileRow
                label="Updated"
                value={user.updatedAt ? format(user.updatedAt, "dd MMM yyyy") : "Unknown"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Latest audit entries tied to this user across the EDMS workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.activity.length === 0 ? (
                <EmptyState message="No user activity has been logged yet." />
              ) : (
                data.activity.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{formatEdmsLabel(entry.action)}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {formatEdmsLabel(entry.entityType)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.createdAt
                          ? format(entry.createdAt, "dd MMM yyyy, hh:mm a")
                          : "Unknown"}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {entry.description ||
                        entry.entityName ||
                        "No additional description recorded."}
                    </p>
                    {entry.projectName ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Project: {entry.projectName}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project memberships</CardTitle>
              <CardDescription>Projects this user currently participates in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.memberships.length === 0 ? (
                <EmptyState message="This user is not assigned to any project yet." />
              ) : (
                data.memberships.map((membership) => (
                  <Link
                    key={membership.id}
                    href={`/dashboard/projects/${membership.projectId}`}
                    className="block rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/35"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{membership.projectName}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {membership.projectNumber || "Project record"}
                        </p>
                      </div>
                      <EdmsStatusBadge status={membership.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border px-2.5 py-1">
                        {formatEdmsLabel(membership.role)}
                      </span>
                      <span className="rounded-full border border-border px-2.5 py-1">
                        Assigned{" "}
                        {membership.assignedAt
                          ? format(membership.assignedAt, "dd MMM yyyy")
                          : "date pending"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded documents</CardTitle>
              <CardDescription>Latest document records created by this user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.uploadedDocuments.length === 0 ? (
                <EmptyState message="This user has not uploaded any controlled documents yet." />
              ) : (
                data.uploadedDocuments.map((document) => (
                  <Link
                    key={document.id}
                    href={`/dashboard/documents/${document.id}`}
                    className="block rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors hover:bg-muted/35"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{document.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {document.documentNumber}
                        </p>
                      </div>
                      <EdmsStatusBadge status={document.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border px-2.5 py-1">
                        {document.projectName}
                      </span>
                      <span className="rounded-full border border-border px-2.5 py-1">
                        {document.revision ? `Rev ${document.revision}` : "No revision"}
                      </span>
                      <span className="rounded-full border border-border px-2.5 py-1">
                        Uploaded{" "}
                        {document.uploadedAt
                          ? format(document.uploadedAt, "dd MMM yyyy")
                          : "date pending"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card className="gap-4 py-5">
      <CardContent className="flex items-start justify-between px-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-3">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
