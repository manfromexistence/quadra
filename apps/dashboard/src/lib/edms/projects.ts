import "server-only";

import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { activityLog } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import type {
  DashboardActivityItem,
  DashboardDocument,
  DashboardWorkflowItem,
} from "@/lib/edms/dashboard";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { canAccessProject } from "./access";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface ProjectMemberSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  organization: string | null;
  assignedLabel: string;
}

export interface ProjectAssignableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string | null;
}

export interface ProjectDetailData {
  project: {
    id: string;
    name: string;
    description: string | null;
    projectNumber: string | null;
    location: string | null;
    status: string;
    clientName: string | null;
    images: string | null;
    startLabel: string;
    endLabel: string;
    metrics: {
      label: string;
      value: string;
      description: string;
    }[];
  };
  members: ProjectMemberSummary[];
  assignableUsers: ProjectAssignableUser[];
  documents: DashboardDocument[];
  workflows: DashboardWorkflowItem[];
  activity: DashboardActivityItem[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

export async function getProjectDetailData(
  projectId: string,
  sessionUser: DashboardSessionUser,
): Promise<ProjectDetailData | null> {
  try {
    const hasAccess = await canAccessProject(sessionUser, projectId);

    if (!hasAccess) {
      return null;
    }

    const [
      projectRows,
      memberCountRows,
      documentCountRows,
      workflowCountRows,
      memberRows,
      userRows,
      documentRows,
      workflowRows,
      activityRows,
    ] = await Promise.all([
      db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          projectNumber: projects.projectNumber,
          location: projects.location,
          status: projects.status,
          startDate: projects.startDate,
          endDate: projects.endDate,
          clientName: userTable.name,
          images: projects.images,
        })
        .from(projects)
        .leftJoin(userTable, eq(projects.clientId, userTable.id))
        .where(eq(projects.id, projectId))
        .limit(1),
      db
        .select({ value: count() })
        .from(projectMembers)
        .where(eq(projectMembers.projectId, projectId)),
      db
        .select({ value: count() })
        .from(documents)
        .where(eq(documents.projectId, projectId)),
      db
        .select({ value: count() })
        .from(documentWorkflows)
        .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
        .where(eq(documents.projectId, projectId)),
      db
        .select({
          id: projectMembers.id,
          userId: userTable.id,
          name: userTable.name,
          email: userTable.email,
          role: projectMembers.role,
          organization: userTable.organization,
          assignedAt: projectMembers.assignedAt,
        })
        .from(projectMembers)
        .innerJoin(userTable, eq(projectMembers.userId, userTable.id))
        .where(eq(projectMembers.projectId, projectId))
        .orderBy(asc(projectMembers.assignedAt)),
      db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          role: userTable.role,
          organization: userTable.organization,
        })
        .from(userTable)
        .orderBy(asc(userTable.name)),
      db
        .select({
          id: documents.id,
          documentNumber: documents.documentNumber,
          title: documents.title,
          projectName: projects.name,
          discipline: documents.discipline,
          revision: documents.revision,
          status: documents.status,
          uploadedAt: documents.uploadedAt,
          images: documents.images,
          fileUrl: documents.fileUrl,
          fileType: documents.fileType,
        })
        .from(documents)
        .innerJoin(projects, eq(documents.projectId, projects.id))
        .where(eq(documents.projectId, projectId))
        .orderBy(desc(documents.uploadedAt))
        .limit(8),
      db
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
        .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
        .innerJoin(projects, eq(documents.projectId, projects.id))
        .where(eq(documents.projectId, projectId))
        .orderBy(asc(workflowSteps.dueDate), desc(documentWorkflows.startedAt))
        .limit(8),
      db
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
        .where(eq(activityLog.projectId, projectId))
        .orderBy(desc(activityLog.createdAt))
        .limit(8),
    ]);

    const [project] = projectRows;

    if (!project) {
      return null;
    }

    const [memberCount] = memberCountRows;
    const [documentCount] = documentCountRows;
    const [workflowCount] = workflowCountRows;

    return {
      project: {
        id: String(project.id),
        name: project.name,
        description: project.description,
        projectNumber: project.projectNumber,
        location: project.location,
        status: project.status,
        clientName: project.clientName,
        images: project.images,
        startLabel: project.startDate
          ? formatAbsoluteDate(project.startDate)
          : "Not scheduled",
        endLabel: project.endDate
          ? formatAbsoluteDate(project.endDate)
          : "Open-ended",
        metrics: [
          {
            label: "Members",
            value: formatCount(memberCount?.value),
            description: "Assigned project participants.",
          },
          {
            label: "Documents",
            value: formatCount(documentCount?.value),
            description: "Controlled project documents.",
          },
          {
            label: "Workflows",
            value: formatCount(workflowCount?.value),
            description: "Review routes linked to this project.",
          },
        ],
      },
      members: memberRows.map((member) => ({
        id: String(member.id),
        userId: member.userId,
        name: member.name,
        email: member.email,
        role: member.role,
        organization: member.organization,
        assignedLabel: member.assignedAt
          ? `Assigned ${formatAbsoluteDate(member.assignedAt)}`
          : "Assignment date pending",
      })),
      assignableUsers: userRows
        .filter(
          (user) => !memberRows.some((member) => member.userId === user.id),
        )
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ?? "user",
          organization: user.organization,
        })),
      documents: documentRows.map((document) => ({
        id: String(document.id),
        documentNumber: document.documentNumber,
        title: document.title,
        projectName: document.projectName,
        discipline: document.discipline,
        revision: document.revision,
        status: document.status,
        uploadedLabel: formatDateLabel(document.uploadedAt, "Uploaded"),
        images: document.images,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
      })),
      workflows: workflowRows.map((workflow) => ({
        id: String(workflow.id),
        documentNumber: workflow.documentNumber,
        title: workflow.title,
        projectName: workflow.projectName,
        stepName: workflow.stepName,
        status: workflow.status,
        assignedRole: workflow.assignedRole,
        dueLabel: formatDateLabel(workflow.dueDate, "Due"),
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
    return createFallbackProjectDetail(projectId, sessionUser, error);
  }
}

async function createFallbackProjectDetail(
  projectId: string,
  sessionUser: DashboardSessionUser,
  error: unknown,
): Promise<ProjectDetailData | null> {
  const fallbackDashboard = await getEdmsDashboardData(sessionUser);
  const project = fallbackDashboard.projects.find(
    (entry) => entry.id === projectId,
  );

  if (!project) {
    return null;
  }

  return {
    project: {
      id: project.id,
      name: project.name,
      description:
        "Fallback project detail is active because the live EDMS tables are not available in this environment yet.",
      projectNumber: project.projectNumber,
      location: project.location,
      status: project.status,
      clientName: "Client assignment pending",
      images: null,
      startLabel: project.schedule,
      endLabel: "Schedule managed after migration",
      metrics: [
        {
          label: "Members",
          value: "4",
          description: "Sample project team assignments.",
        },
        {
          label: "Documents",
          value: String(fallbackDashboard.documents.length),
          description: "Sample documents associated with this project.",
        },
        {
          label: "Workflows",
          value: String(fallbackDashboard.workflowQueue.length),
          description: "Sample workflow steps for this project.",
        },
      ],
    },
    members: [
      {
        id: "fallback-member-1",
        userId: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: "admin",
        organization: sessionUser.organization,
        assignedLabel: "Assigned 01 Apr 2026",
      },
      {
        id: "fallback-member-2",
        userId: "fallback-user-2",
        name: "Ayesha Karim",
        email: "ayesha.karim@example.com",
        role: "pmc",
        organization: "PMC Core",
        assignedLabel: "Assigned 31 Mar 2026",
      },
    ],
    assignableUsers: [
      {
        id: "fallback-user-3",
        name: "Sabbir Rahman",
        email: "sabbir.rahman@example.com",
        role: "vendor",
        organization: "Metro Fabrication",
      },
      {
        id: "fallback-user-4",
        name: "Nadia Islam",
        email: "nadia.islam@example.com",
        role: "client",
        organization: "Structura Developments",
      },
    ],
    documents: fallbackDashboard.documents.filter(
      (document) => document.projectName === project.name,
    ),
    workflows: fallbackDashboard.workflowQueue.filter(
      (workflow) => workflow.projectName === project.name,
    ),
    activity: fallbackDashboard.activity.filter(
      (entry) => entry.projectName === project.name,
    ),
    isUsingFallbackData: true,
    statusMessage: getFallbackMessage(error),
  };
}

function formatCount(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
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

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing sample project data while the live EDMS workspace is still being connected.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing sample project data because DATABASE_URL is not configured in this environment.";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    return "Showing sample project data until the EDMS database migrations are applied.";
  }

  return "Showing sample project data while the live EDMS workspace is still being connected.";
}
