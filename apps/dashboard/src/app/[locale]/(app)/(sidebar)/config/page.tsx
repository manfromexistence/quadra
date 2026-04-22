import { Card, CardContent } from "@midday/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getProjectConfigData } from "@/lib/edms/project-config";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";
import { ConfigDisciplines } from "./tabs/disciplines";
import { ConfigDocTypes } from "./tabs/doc-types";
import { ConfigGeneral } from "./tabs/general";
import { ConfigNumbering } from "./tabs/numbering";
import { ConfigStakeholders } from "./tabs/stakeholders";
import { ConfigWorkflow } from "./tabs/workflow";

export const metadata: Metadata = {
  title: "Project Setup | Quadra EDMS",
};

export default async function ProjectSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const sessionUser = await getRequiredDashboardSessionUser();
  const params = await searchParams;

  // Use provided projectId or get first available project
  let projectId = params.projectId;

  if (!projectId) {
    // Get user's projects and use the first one
    const dashboardData = await getEdmsDashboardData(sessionUser);

    if (dashboardData.projects.length === 0) {
      // No projects available, show message
      return (
        <ScrollableContent>
          <div className="flex flex-col gap-6 pt-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Project Setup
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                No projects available. Please create a project first.
              </p>
            </div>
          </div>
        </ScrollableContent>
      );
    }

    projectId = dashboardData.projects[0].id;
  }

  const configData = await getProjectConfigData(sessionUser, projectId);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Project Setup
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Define the numbering scheme, disciplines, document types,
                  stakeholders, and approval workflow for this project.
                </p>
              </div>
            </div>
          </div>

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading configuration...
                </div>
              }
            >
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-0">
                  <Tabs defaultValue="general" className="w-full">
                    <div className="border-b border-border px-6 pt-6">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="numbering">
                          Numbering Scheme
                        </TabsTrigger>
                        <TabsTrigger value="disciplines">
                          Disciplines
                          {configData.disciplines.length > 0 && (
                            <span className="ml-1 text-xs">
                              ({configData.disciplines.length})
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="doctypes">
                          Document Types
                          {configData.documentTypes.length > 0 && (
                            <span className="ml-1 text-xs">
                              ({configData.documentTypes.length})
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="stakeholders">
                          Stakeholders
                          {configData.stakeholders.length > 0 && (
                            <span className="ml-1 text-xs">
                              ({configData.stakeholders.length})
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="workflow">Workflow</TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-6">
                      <TabsContent value="general" className="mt-0">
                        <ConfigGeneral
                          sessionUser={sessionUser}
                          projectId={projectId}
                          config={configData.config}
                        />
                      </TabsContent>

                      <TabsContent value="numbering" className="mt-0">
                        <ConfigNumbering
                          projectId={projectId}
                          config={configData.config}
                        />
                      </TabsContent>

                      <TabsContent value="disciplines" className="mt-0">
                        <ConfigDisciplines
                          projectId={projectId}
                          disciplines={configData.disciplines}
                        />
                      </TabsContent>

                      <TabsContent value="doctypes" className="mt-0">
                        <ConfigDocTypes
                          projectId={projectId}
                          documentTypes={configData.documentTypes}
                        />
                      </TabsContent>

                      <TabsContent value="stakeholders" className="mt-0">
                        <ConfigStakeholders
                          projectId={projectId}
                          stakeholders={configData.stakeholders}
                        />
                      </TabsContent>

                      <TabsContent value="workflow" className="mt-0">
                        <ConfigWorkflow
                          projectId={projectId}
                          workflowSteps={configData.workflowSteps}
                          config={configData.config}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
