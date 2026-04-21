import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { activityLog, notifications } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import { transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { expandStorageUrl } from "@/lib/storage-utils";
import { getProjectAccessScope } from "./access";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  organization: string | null;
}

export interface DashboardMetric {
  label: string;
  value: string;
  description: string;
  tone: "amber" | "blue" | "emerald" | "rose" | "slate";
  icon: "projects" | "documents" | "reviews" | "transmittals" | "notifications";
}

export interface DashboardProject {
  id: string;
  name: string;
  projectNumber: string | null;
  location: string | null;
  status: string;
  schedule: string;
  images: string | null;
}

export interface DashboardDocument {
  id: string;
  documentNumber: string;
  title: string;
  projectName: string;
  discipline: string | null;
  category?: string | null;
  revision: string | null;
  status: string;
  author?: string | null;
  fileSize?: number | null;
  uploadedLabel: string;
  images: string | null;
  fileUrl: string;
  fileType: string | null;
}

export interface DashboardWorkflowItem {
  id: string;
  documentNumber: string;
  title: string;
  projectName: string;
  stepName: string;
  status: string;
  assignedRole: string | null;
  dueLabel: string;
}

export interface DashboardTransmittal {
  id: string;
  transmittalNumber: string;
  subject: string;
  projectName: string;
  status: string;
  sentLabel: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  projectName: string | null;
  isRead: boolean;
  actionUrl: string | null;
  createdLabel: string;
}

export interface DashboardActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityName: string | null;
  description: string | null;
  actorName: string;
  projectName: string | null;
  createdLabel: string;
}

export interface EdmsDashboardData {
  user: DashboardUser;
  metrics: DashboardMetric[];
  projects: DashboardProject[];
  documents: DashboardDocument[];
  workflowQueue: DashboardWorkflowItem[];
  transmittals: DashboardTransmittal[];
  notifications: DashboardNotification[];
  activity: DashboardActivityItem[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

export async function getEdmsDashboardData(
  sessionUser: DashboardSessionUser,
): Promise<EdmsDashboardData> {
  try {
    const accessScope = await getProjectAccessScope(sessionUser);
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
    const scopedActivityCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(activityLog.projectId, accessScope.projectIds)
        : null;

    const [
      userRows,
      projectCountRows,
      documentCountRows,
      pendingReviewRows,
      openTransmittalRows,
      unreadNotificationRows,
      projectRows,
      documentRows,
      workflowRows,
      transmittalRows,
      notificationRows,
      activityRows,
    ] = await Promise.all([
      db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          image: userTable.image,
          role: userTable.role,
          organization: userTable.organization,
        })
        .from(userTable)
        .where(eq(userTable.id, sessionUser.id))
        .limit(1),
      scopedProjectCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(projects)
            .where(scopedProjectCondition),
      scopedDocumentCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(documents)
            .where(scopedDocumentCondition),
      db
        .select({ value: count() })
        .from(workflowSteps)
        .innerJoin(
          documentWorkflows,
          eq(workflowSteps.workflowId, documentWorkflows.id),
        )
        .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
        .where(
          and(
            inArray(workflowSteps.status, ["pending", "in_progress"]),
            scopedDocumentCondition ?? undefined,
          ),
        ),
      db
        .select({ value: count() })
        .from(transmittals)
        .where(
          and(
            inArray(transmittals.status, ["draft", "sent"]),
            scopedTransmittalCondition ?? undefined,
          ),
        ),
      db
        .select({ value: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, sessionUser.id),
            eq(notifications.isRead, false),
          ),
        ),
      scopedProjectCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: projects.id,
              name: projects.name,
              projectNumber: projects.projectNumber,
              location: projects.location,
              status: projects.status,
              startDate: projects.startDate,
              endDate: projects.endDate,
              updatedAt: projects.updatedAt,
              images: projects.images,
            })
            .from(projects)
            .where(scopedProjectCondition)
            .orderBy(desc(projects.updatedAt))
            .limit(5),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: documents.id,
              documentNumber: documents.documentNumber,
              title: documents.title,
              projectName: projects.name,
              discipline: documents.discipline,
              category: documents.category,
              revision: documents.revision,
              status: documents.status,
              createdBy: documents.createdBy,
              fileSize: documents.fileSize,
              uploadedAt: documents.uploadedAt,
              images: documents.images,
              fileUrl: documents.fileUrl,
              fileType: documents.fileType,
            })
            .from(documents)
            .innerJoin(projects, eq(documents.projectId, projects.id))
            .where(scopedDocumentCondition)
            .orderBy(desc(documents.uploadedAt))
            .limit(6),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: workflowSteps.id,
              documentNumber: documents.documentNumber,
              title: documents.title,
              projectName: projects.name,
              stepName: workflowSteps.stepName,
              status: workflowSteps.status,
              assignedRole: workflowSteps.assignedRole,
              dueDate: workflowSteps.dueDate,
            })
            .from(workflowSteps)
            .innerJoin(
              documentWorkflows,
              eq(workflowSteps.workflowId, documentWorkflows.id),
            )
            .innerJoin(
              documents,
              eq(documentWorkflows.documentId, documents.id),
            )
            .innerJoin(projects, eq(documents.projectId, projects.id))
            .where(
              and(
                inArray(workflowSteps.status, ["pending", "in_progress"]),
                scopedDocumentCondition,
              ),
            )
            .orderBy(
              asc(workflowSteps.dueDate),
              desc(documentWorkflows.startedAt),
            )
            .limit(6),
      scopedTransmittalCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: transmittals.id,
              transmittalNumber: transmittals.transmittalNumber,
              subject: transmittals.subject,
              projectName: projects.name,
              status: transmittals.status,
              sentAt: transmittals.sentAt,
              createdAt: transmittals.createdAt,
            })
            .from(transmittals)
            .innerJoin(projects, eq(transmittals.projectId, projects.id))
            .where(scopedTransmittalCondition)
            .orderBy(desc(transmittals.createdAt))
            .limit(5),
      db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          type: notifications.type,
          projectName: projects.name,
          isRead: notifications.isRead,
          actionUrl: notifications.actionUrl,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .leftJoin(projects, eq(notifications.projectId, projects.id))
        .where(eq(notifications.userId, sessionUser.id))
        .orderBy(desc(notifications.createdAt))
        .limit(6),
      scopedActivityCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: activityLog.id,
              action: activityLog.action,
              entityType: activityLog.entityType,
              entityName: activityLog.entityName,
              description: activityLog.description,
              actorName: userTable.name,
              projectName: projects.name,
              createdAt: activityLog.createdAt,
            })
            .from(activityLog)
            .leftJoin(userTable, eq(activityLog.userId, userTable.id))
            .leftJoin(projects, eq(activityLog.projectId, projects.id))
            .where(scopedActivityCondition)
            .orderBy(desc(activityLog.createdAt))
            .limit(7),
    ]);

    const [userProfile] = userRows;
    const [projectCount] = projectCountRows;
    const [documentCount] = documentCountRows;
    const [pendingReviews] = pendingReviewRows;
    const [openTransmittals] = openTransmittalRows;
    const [unreadNotifications] = unreadNotificationRows;

    return {
      user: {
        id: userProfile?.id ?? sessionUser.id,
        name: userProfile?.name ?? sessionUser.name,
        email: userProfile?.email ?? sessionUser.email,
        image: userProfile?.image ?? sessionUser.image,
        role: userProfile?.role ?? sessionUser.role,
        organization: userProfile?.organization ?? sessionUser.organization,
      },
      metrics: [
        {
          label: "Active projects",
          value: formatCount(projectCount?.value),
          description:
            "Projects currently being coordinated through the EDMS workspace.",
          tone: "amber",
          icon: "projects",
        },
        {
          label: "Controlled documents",
          value: formatCount(documentCount?.value),
          description:
            "Latest drawing, specification, and report revisions available to the team.",
          tone: "blue",
          icon: "documents",
        },
        {
          label: "Pending reviews",
          value: formatCount(pendingReviews?.value),
          description:
            "Workflow steps waiting on PMC, client, or vendor action.",
          tone: "emerald",
          icon: "reviews",
        },
        {
          label: "Open transmittals",
          value: formatCount(openTransmittals?.value),
          description:
            "Draft and sent packages still moving across project parties.",
          tone: "rose",
          icon: "transmittals",
        },
        {
          label: "Unread alerts",
          value: formatCount(unreadNotifications?.value),
          description:
            "Recent delivery, review, and approval notices still awaiting attention.",
          tone: "slate",
          icon: "notifications",
        },
      ],
      projects: projectRows.map((project) => ({
        id: String(project.id),
        name: project.name,
        projectNumber: project.projectNumber,
        location: project.location,
        status: project.status,
        schedule: formatProjectSchedule(
          project.startDate,
          project.endDate,
          project.updatedAt,
        ),
        images: project.images, // Keep truncated for now, expand in component
      })),
      documents: documentRows.map((document) => ({
        id: String(document.id),
        documentNumber: document.documentNumber,
        title: document.title,
        projectName: document.projectName,
        discipline: document.discipline,
        category: document.category,
        revision: document.revision,
        status: document.status,
        author: document.createdBy,
        fileSize: document.fileSize,
        uploadedLabel: formatDateLabel(document.uploadedAt, "Uploaded"),
        images: document.images, // Keep truncated for now, expand in component
        fileUrl: expandStorageUrl(document.fileUrl), // Expand file URL
        fileType: document.fileType,
      })),
      workflowQueue: workflowRows.map((workflow) => ({
        id: String(workflow.id),
        documentNumber: workflow.documentNumber,
        title: workflow.title,
        projectName: workflow.projectName,
        stepName: workflow.stepName,
        status: workflow.status,
        assignedRole: workflow.assignedRole,
        dueLabel: formatDateLabel(workflow.dueDate, "Due"),
      })),
      transmittals: transmittalRows.map((transmittal) => ({
        id: String(transmittal.id),
        transmittalNumber: transmittal.transmittalNumber,
        subject: transmittal.subject,
        projectName: transmittal.projectName,
        status: transmittal.status,
        sentLabel: formatDateLabel(
          transmittal.sentAt ?? transmittal.createdAt,
          "Updated",
        ),
      })),
      notifications: notificationRows.map((notification) => ({
        id: String(notification.id),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        projectName: notification.projectName,
        isRead: notification.isRead,
        actionUrl: notification.actionUrl,
        createdLabel: formatDateLabel(notification.createdAt, "Created"),
      })),
      activity: activityRows.map((entry) => ({
        id: String(entry.id),
        action: entry.action,
        entityType: entry.entityType,
        entityName: entry.entityName,
        description: entry.description,
        actorName: entry.actorName ?? "System",
        projectName: entry.projectName,
        createdLabel: formatDateLabel(entry.createdAt, "Logged"),
      })),
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    console.error("Error fetching EDMS dashboard data:", error);
    return {
      user: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.image,
        role: sessionUser.role,
        organization: sessionUser.organization,
      },
      metrics: [
        {
          label: "Active projects",
          value: "0",
          description:
            "Projects currently being coordinated through the EDMS workspace.",
          tone: "amber",
          icon: "projects",
        },
        {
          label: "Controlled documents",
          value: "0",
          description:
            "Latest drawing, specification, and report revisions available to the team.",
          tone: "blue",
          icon: "documents",
        },
        {
          label: "Pending reviews",
          value: "0",
          description:
            "Workflow steps waiting on PMC, client, or vendor action.",
          tone: "emerald",
          icon: "reviews",
        },
        {
          label: "Open transmittals",
          value: "0",
          description:
            "Draft and sent packages still moving across project parties.",
          tone: "rose",
          icon: "transmittals",
        },
        {
          label: "Unread alerts",
          value: "0",
          description:
            "Recent delivery, review, and approval notices still awaiting attention.",
          tone: "slate",
          icon: "notifications",
        },
      ],
      projects: [],
      documents: [],
      workflowQueue: [],
      transmittals: [],
      notifications: [],
      activity: [],
      isUsingFallbackData: true,
      statusMessage:
        "Unable to load data. Please check your connection and try again.",
    };
  }
}

function formatCount(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

function formatProjectSchedule(
  startDate: Date | null,
  endDate: Date | null,
  updatedAt: Date | null,
) {
  if (endDate) {
    return `Ends ${formatAbsoluteDate(endDate)}`;
  }

  if (startDate) {
    return `Started ${formatAbsoluteDate(startDate)}`;
  }

  if (updatedAt) {
    return `Updated ${formatAbsoluteDate(updatedAt)}`;
  }

  return "Schedule pending";
}

function formatDateLabel(date: Date | null, prefix: string) {
  if (!date) {
    return `${prefix} not scheduled`;
  }

  return `${prefix} ${formatAbsoluteDate(date)}`;
}

function formatAbsoluteDate(date: Date) {
  return formatStoredAbsoluteDate(date) ?? "Date pending";
}
