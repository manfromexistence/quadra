import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getLetters } from "@/lib/edms/correspondence";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { LettersPageClient } from "./letters-page-client";

export default async function LettersPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No accessible projects found. Please contact your administrator.
            </p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

  const letters = await getLetters(projectId);

  return (
    <ScrollableContent>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense
          fallback={
            <div className="text-sm text-muted-foreground">Loading...</div>
          }
        >
          <LettersPageClient letters={letters} projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </ScrollableContent>
  );
}
