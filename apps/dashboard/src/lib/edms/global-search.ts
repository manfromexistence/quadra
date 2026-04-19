import "server-only";

import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import { transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { getProjectAccessScopeByUserId } from "./access";

export type EdmsSearchCategory =
  | "project"
  | "document"
  | "workflow"
  | "transmittal"
  | "notification";

export interface EdmsSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: EdmsSearchCategory;
  href: string;
  meta: string;
}

export interface EdmsGlobalSearchItem {
  id: string;
  type:
    | "edms_project"
    | "edms_document"
    | "edms_workflow"
    | "edms_transmittal"
    | "edms_notification";
  title: string;
  subtitle: string;
  href: string;
  meta: string;
}

export async function searchEdms(
  userId: string,
  rawQuery: string,
  limitPerCategory = 5,
): Promise<EdmsSearchResult[]> {
  const query = rawQuery.trim();

  if (!query) {
    return [];
  }

  const accessScope = await getProjectAccessScopeByUserId(userId);
  const searchPattern = `%${escapeLikePattern(query)}%`;

  const scopedProjectCondition = accessScope.isAdmin
    ? undefined
    : accessScope.projectIds.length > 0
      ? inArray(projects.id, accessScope.projectIds)
      : null;
  const scopedDocumentCondition = accessScope.isAdmin
    ? undefined
    : accessScope.projectIds.length > 0
      ? inArray(documents.projectId, accessScope.projectIds)
      : null;
  const scopedTransmittalCondition = accessScope.isAdmin
    ? undefined
    : accessScope.projectIds.length > 0
      ? inArray(transmittals.projectId, accessScope.projectIds)
      : null;

  const [
    projectRows,
    documentRows,
    workflowRows,
    transmittalRows,
    notificationRows,
  ] = await Promise.all([
    scopedProjectCondition === null
      ? Promise.resolve([])
      : db
          .select({
            id: projects.id,
            name: projects.name,
            projectNumber: projects.projectNumber,
            description: projects.description,
          })
          .from(projects)
          .where(
            and(
              scopedProjectCondition,
              or(
                ilike(projects.name, searchPattern),
                ilike(projects.projectNumber, searchPattern),
                ilike(projects.description, searchPattern),
              ),
            ),
          )
          .orderBy(asc(projects.name))
          .limit(limitPerCategory),
    scopedDocumentCondition === null
      ? Promise.resolve([])
      : db
          .select({
            id: documents.id,
            title: documents.title,
            documentNumber: documents.documentNumber,
            projectName: projects.name,
            discipline: documents.discipline,
            category: documents.category,
          })
          .from(documents)
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .where(
            and(
              scopedDocumentCondition,
              or(
                ilike(documents.title, searchPattern),
                ilike(documents.documentNumber, searchPattern),
                ilike(documents.description, searchPattern),
                ilike(projects.name, searchPattern),
              ),
            ),
          )
          .orderBy(desc(documents.uploadedAt))
          .limit(limitPerCategory),
    scopedDocumentCondition === null
      ? Promise.resolve([])
      : db
          .select({
            id: workflowSteps.id,
            workflowId: documentWorkflows.id,
            stepName: workflowSteps.stepName,
            status: workflowSteps.status,
            assignedToName: userTable.name,
            documentNumber: documents.documentNumber,
            documentTitle: documents.title,
            projectName: projects.name,
          })
          .from(workflowSteps)
          .innerJoin(
            documentWorkflows,
            eq(workflowSteps.workflowId, documentWorkflows.id),
          )
          .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .leftJoin(userTable, eq(workflowSteps.assignedTo, userTable.id))
          .where(
            and(
              scopedDocumentCondition,
              or(
                ilike(workflowSteps.stepName, searchPattern),
                ilike(workflowSteps.status, searchPattern),
                ilike(documents.documentNumber, searchPattern),
                ilike(documents.title, searchPattern),
                ilike(projects.name, searchPattern),
              ),
            ),
          )
          .orderBy(
            asc(workflowSteps.dueDate),
            desc(documentWorkflows.startedAt),
          )
          .limit(limitPerCategory),
    scopedTransmittalCondition === null
      ? Promise.resolve([])
      : db
          .select({
            id: transmittals.id,
            transmittalNumber: transmittals.transmittalNumber,
            subject: transmittals.subject,
            description: transmittals.description,
            projectName: projects.name,
            status: transmittals.status,
          })
          .from(transmittals)
          .innerJoin(projects, eq(transmittals.projectId, projects.id))
          .where(
            and(
              scopedTransmittalCondition,
              or(
                ilike(transmittals.transmittalNumber, searchPattern),
                ilike(transmittals.subject, searchPattern),
                ilike(transmittals.description, searchPattern),
                ilike(projects.name, searchPattern),
              ),
            ),
          )
          .orderBy(desc(transmittals.createdAt))
          .limit(limitPerCategory),
    db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        projectName: projects.name,
        type: notifications.type,
        actionUrl: notifications.actionUrl,
      })
      .from(notifications)
      .leftJoin(projects, eq(notifications.projectId, projects.id))
      .where(
        and(
          eq(notifications.userId, userId),
          or(
            ilike(notifications.title, searchPattern),
            ilike(notifications.message, searchPattern),
            ilike(projects.name, searchPattern),
          ),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limitPerCategory),
  ]);

  return [
    ...projectRows.map((project) => ({
      id: String(project.id),
      title: project.name,
      subtitle: project.projectNumber ?? "Project",
      category: "project" as const,
      href: `/projects/${project.id}`,
      meta: project.description?.trim() || "Project workspace",
    })),
    ...documentRows.map((document) => ({
      id: String(document.id),
      title: document.title,
      subtitle: document.documentNumber,
      category: "document" as const,
      href: `/documents/${document.id}`,
      meta: [
        document.projectName,
        document.discipline || document.category || "Document",
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...workflowRows.map((workflow) => ({
      id: String(workflow.id),
      title: workflow.stepName,
      subtitle: workflow.documentNumber,
      category: "workflow" as const,
      href: `/workflows/${workflow.workflowId}`,
      meta: [
        workflow.projectName,
        workflow.documentTitle,
        workflow.assignedToName
          ? `Assigned to ${workflow.assignedToName}`
          : workflow.status,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...transmittalRows.map((transmittal) => ({
      id: String(transmittal.id),
      title: transmittal.subject,
      subtitle: transmittal.transmittalNumber,
      category: "transmittal" as const,
      href: `/transmittals/${transmittal.id}`,
      meta: [transmittal.projectName, transmittal.status]
        .filter(Boolean)
        .join(" · "),
    })),
    ...notificationRows.map((notification) => ({
      id: String(notification.id),
      title: notification.title,
      subtitle: notification.projectName ?? "Notification",
      category: "notification" as const,
      href: notification.actionUrl || "/notifications",
      meta: notification.message,
    })),
  ];
}

export async function searchEdmsForCommandPalette(
  userId: string,
  query: string,
  limitPerCategory = 5,
): Promise<EdmsGlobalSearchItem[]> {
  const results = await searchEdms(userId, query, limitPerCategory);

  return results.map((result) => ({
    id: `${result.category}:${result.id}`,
    type: mapResultCategoryToGlobalType(result.category),
    title: result.title,
    subtitle: result.subtitle,
    href: result.href,
    meta: result.meta,
  }));
}

function mapResultCategoryToGlobalType(
  category: EdmsSearchCategory,
): EdmsGlobalSearchItem["type"] {
  switch (category) {
    case "project":
      return "edms_project";
    case "document":
      return "edms_document";
    case "workflow":
      return "edms_workflow";
    case "transmittal":
      return "edms_transmittal";
    default:
      return "edms_notification";
  }
}

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
