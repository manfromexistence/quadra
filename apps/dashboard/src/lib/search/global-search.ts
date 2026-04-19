import { like, or } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import { transmittals } from "@/db/schema/transmittals";
import { documentWorkflows } from "@/db/schema/workflows";

export interface GlobalSearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href?: string;
  meta?: string;
  data?: Record<string, any>;
}

export async function globalSearch(
  db: LibSQLDatabase,
  query: string,
  limit = 50,
): Promise<GlobalSearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;
  const results: GlobalSearchResult[] = [];

  try {
    // Search projects
    const projectResults = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        projectNumber: projects.projectNumber,
        location: projects.location,
        status: projects.status,
      })
      .from(projects)
      .where(
        or(
          like(projects.name, searchTerm),
          like(projects.description, searchTerm),
          like(projects.projectNumber, searchTerm),
          like(projects.location, searchTerm),
        ),
      )
      .limit(10);

    for (const project of projectResults) {
      results.push({
        id: project.id,
        type: "edms_project",
        title: project.name,
        subtitle: project.projectNumber || undefined,
        meta: project.location || undefined,
        href: `/projects?projectId=${project.id}`,
        data: project,
      });
    }

    // Search documents
    const documentResults = await db
      .select({
        id: documents.id,
        documentNumber: documents.documentNumber,
        title: documents.title,
        description: documents.description,
        discipline: documents.discipline,
        category: documents.category,
        status: documents.status,
        revision: documents.revision,
      })
      .from(documents)
      .where(
        or(
          like(documents.documentNumber, searchTerm),
          like(documents.title, searchTerm),
          like(documents.description, searchTerm),
          like(documents.discipline, searchTerm),
        ),
      )
      .limit(15);

    for (const doc of documentResults) {
      results.push({
        id: doc.id,
        type: "edms_document",
        title: doc.title,
        subtitle: doc.documentNumber,
        meta: [doc.discipline, doc.status].filter(Boolean).join(" · "),
        href: `/documents?documentId=${doc.id}`,
        data: doc,
      });
    }

    // Search workflows
    const workflowResults = await db
      .select({
        id: documentWorkflows.id,
        workflowName: documentWorkflows.workflowName,
        status: documentWorkflows.status,
        currentStep: documentWorkflows.currentStep,
        totalSteps: documentWorkflows.totalSteps,
        documentId: documentWorkflows.documentId,
      })
      .from(documentWorkflows)
      .where(like(documentWorkflows.workflowName, searchTerm))
      .limit(10);

    for (const workflow of workflowResults) {
      results.push({
        id: workflow.id,
        type: "edms_workflow",
        title: workflow.workflowName,
        subtitle: `Step ${workflow.currentStep}/${workflow.totalSteps}`,
        meta: workflow.status,
        href: `/workflows?workflowId=${workflow.id}`,
        data: workflow,
      });
    }

    // Search transmittals
    const transmittalResults = await db
      .select({
        id: transmittals.id,
        transmittalNumber: transmittals.transmittalNumber,
        subject: transmittals.subject,
        purpose: transmittals.purpose,
        status: transmittals.status,
        sentTo: transmittals.sentTo,
      })
      .from(transmittals)
      .where(
        or(
          like(transmittals.transmittalNumber, searchTerm),
          like(transmittals.subject, searchTerm),
          like(transmittals.sentTo, searchTerm),
        ),
      )
      .limit(10);

    for (const transmittal of transmittalResults) {
      results.push({
        id: transmittal.id,
        type: "edms_transmittal",
        title: transmittal.transmittalNumber,
        subtitle: transmittal.subject,
        meta: [transmittal.purpose, transmittal.status]
          .filter(Boolean)
          .join(" · "),
        href: `/transmittals?transmittalId=${transmittal.id}`,
        data: transmittal,
      });
    }

    // Search notifications
    const notificationResults = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        isRead: notifications.isRead,
      })
      .from(notifications)
      .where(
        or(
          like(notifications.title, searchTerm),
          like(notifications.message, searchTerm),
        ),
      )
      .limit(10);

    for (const notification of notificationResults) {
      results.push({
        id: notification.id,
        type: "edms_notification",
        title: notification.title,
        subtitle: notification.message,
        meta: notification.isRead ? "Read" : "Unread",
        href: `/notifications?notificationId=${notification.id}`,
        data: notification,
      });
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error("Global search error:", error);
    return [];
  }
}
