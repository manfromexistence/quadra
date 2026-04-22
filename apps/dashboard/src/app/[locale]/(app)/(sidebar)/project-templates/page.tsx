import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { ProjectTemplateUploadSheet } from "@/components/edms/project-template-upload-sheet";
import { ErrorFallback } from "@/components/error-fallback";
import { ProjectTemplatesTable } from "@/components/project-templates-table";
import { ScrollableContent } from "@/components/scrollable-content";
import { getProjectTemplates } from "@/lib/edms/project-templates";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Project Templates | Quadra EDMS",
};

export default async function ProjectTemplatesPage() {
  const _sessionUser = await getRequiredDashboardSessionUser();
  const templates = await getProjectTemplates();

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  }
  return (
    <ScrollableContent>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className="text-sm text-muted-foreground">Loading...</div>
          }
        >
          <div className="flex flex-col gap-6 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-3">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    Project Templates
                  </h1>
                  <p className="text-sm leading-6 text-muted-foreground md:text-base">
                    Upload and manage project document templates including
                    letters, memos, CRS, MoM, and other standard formats.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ProjectTemplateUploadSheet />
              </div>
            </div>

            <Card className="rounded-lg border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Template Library</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ProjectTemplatesTable
                  templates={templates}
                  formatFileSize={formatFileSize}
                />
              </CardContent>
            </Card>
          </div>
        </Suspense>
      </ErrorBoundary>
    </ScrollableContent>
  );
}
