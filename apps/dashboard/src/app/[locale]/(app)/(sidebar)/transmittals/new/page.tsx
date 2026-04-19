import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createTransmittal } from "@/actions/transmittals";
import { TransmittalFormWithPreview } from "@/components/edms/transmittal-form-with-preview";
import { ScrollableContent } from "@/components/scrollable-content";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getTransmittalManagementData } from "@/lib/edms/transmittals";

export const metadata: Metadata = {
  title: "New Transmittal | Quadra EDMS",
};

export default async function NewTransmittalPage() {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (!canManageEdmsContent(sessionUser.role)) {
    redirect("/transmittals");
  }

  const data = await getTransmittalManagementData(sessionUser);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Transmittals / New
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Prepare Transmittal
          </h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Compose a formal transmittal to issue documents to a stakeholder.
            The system auto-generates the ID and applies the distribution
            matrix.
          </p>
        </div>

        <TransmittalFormWithPreview
          projects={data.projects}
          members={data.members}
          documents={data.documents}
          onSubmit={createTransmittal}
        />
      </div>
    </ScrollableContent>
  );
}
