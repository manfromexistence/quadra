import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/settings/account-profile-form";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { SettingsHeader } from "../components/settings-header";
import { DeleteAccountSection } from "./components/delete-account-section";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth");

  const userRows = await db
    .select({
      name: userTable.name,
      role: userTable.role,
      organization: userTable.organization,
      jobTitle: userTable.jobTitle,
      phone: userTable.phone,
      department: userTable.department,
      image: userTable.image,
      notificationPreferences: userTable.notificationPreferences,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  const [user] = userRows;
  const params = await searchParams;
  const onboarding = params.onboarding === "1";
  const notificationPreferences = parseNotificationPreferences(user?.notificationPreferences);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Account"
        description="Manage your EDMS profile, organizational role, and account settings."
      />
      {onboarding ? (
        <div className="rounded-2xl border bg-card p-4 text-sm text-foreground">
          Complete your EDMS profile before accessing project, document, workflow, and transmittal
          modules.
        </div>
      ) : null}
      <AccountProfileForm
        defaultValues={{
          name: user?.name ?? session.user.name ?? "",
          role:
            typeof user?.role === "string" &&
            ["admin", "client", "pmc", "vendor", "subcontractor", "user"].includes(user.role)
              ? (user.role as "admin" | "client" | "pmc" | "vendor" | "subcontractor" | "user")
              : "user",
          organization: user?.organization ?? "",
          jobTitle: user?.jobTitle ?? "",
          phone: user?.phone ?? "",
          department: user?.department ?? "",
          image: user?.image ?? session.user.image ?? "",
        }}
      />
      <NotificationPreferencesForm defaultValues={notificationPreferences} />
      <DeleteAccountSection />
    </div>
  );
}

function parseNotificationPreferences(value: string | null | undefined) {
  const defaults = {
    documentSubmission: true,
    reviewRequest: true,
    approvalDecision: true,
    transmittalUpdate: true,
    emailNotifications: false,
  };

  if (!value) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(value) as Partial<typeof defaults>;
    return {
      documentSubmission: parsed.documentSubmission ?? defaults.documentSubmission,
      reviewRequest: parsed.reviewRequest ?? defaults.reviewRequest,
      approvalDecision: parsed.approvalDecision ?? defaults.approvalDecision,
      transmittalUpdate: parsed.transmittalUpdate ?? defaults.transmittalUpdate,
      emailNotifications: parsed.emailNotifications ?? defaults.emailNotifications,
    };
  } catch {
    return defaults;
  }
}
