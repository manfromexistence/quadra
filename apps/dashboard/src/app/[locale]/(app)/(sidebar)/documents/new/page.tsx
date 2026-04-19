import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DocumentUploadForm } from "@/components/edms/document-upload-form";
import { ScrollableContent } from "@/components/scrollable-content";
import { getDocumentControlData } from "@/lib/edms/documents";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "New Document | Quadra EDMS",
};

export default async function NewDocumentPage() {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (!canManageEdmsContent(sessionUser.role)) {
    redirect("/documents");
  }

  const data = await getDocumentControlData(sessionUser, {});

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Documents / New
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Upload Document
          </h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Upload a new document to the register with metadata and file
            attachment. The document code will be auto-generated based on your
            selections.
          </p>
        </div>

        <DocumentUploadForm projects={data.projects} />
      </div>
    </ScrollableContent>
  );
}
