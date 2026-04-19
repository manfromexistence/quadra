import "server-only";

import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { getProjectAccessScope } from "./access";
import { type DashboardMetric, getEdmsDashboardData } from "./dashboard";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface WorkflowDocumentOption {
  id: string;
  projectId: string;
  documentNumber: string;
  title: string;
  projectName: string;
  status: string;
}

export interface WorkflowAssigneeOption {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: string;
  organization: string | null;
}

export interface WorkflowStepSummary {
  id: string;
  workflowId: string;
  documentId: string;
  projectId: string;
  documentNumber: string;
  title: string;
  projectName: string;
  workflowName: string;
  stepNumber: number;
  totalSteps: number;
  stepName: string;
  status: string;
  assignedRole: string | null;
  assignedToName: string;
  dueLabel: string;
  comments: string | null;
  isActionable: boolean;
}

export interface WorkflowManagementData {
  metrics: DashboardMetric[];
  documents: WorkflowDocumentOption[];
  assignees: WorkflowAssigneeOption[];
  steps: WorkflowStepSummary[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

export async function getWorkflowManagementData(
  sessionUser: DashboardSessionUser,
): Promise<WorkflowManagementData> {
  try {
    const accessScope = await getProjectAccessScope(sessionUser);
    const scopedDocumentCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(documents.projectId, accessScope.projectIds)
        : null;
    const scopedProjectMemberCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(projectMembers.projectId, accessScope.projectIds)
        : null;

    const [
      workflowCountRows,
      pendingStepRows,
      approvedWorkflowRows,
      notificationRows,
      documentRows,
      assigneeRows,
      stepRows,
    ] = await Promise.all([
      scopedDocumentCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(documentWorkflows)
            .innerJoin(
              documents,
              eq(documentWorkflows.documentId, documents.id),
            )
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
      scopedDocumentCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(documentWorkflows)
            .innerJoin(
              documents,
              eq(documentWorkflows.documentId, documents.id),
            )
            .where(
              and(
                eq(documentWorkflows.status, "approved"),
                scopedDocumentCondition,
              ),
            ),
      db
        .select({ value: count() })
        .from(notifications)
        .where(eq(notifications.userId, sessionUser.id)),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: documents.id,
              projectId: documents.projectId,
              documentNumber: documents.documentNumber,
              title: documents.title,
              projectName: projects.name,
              status: documents.status,
            })
            .from(documents)
            .innerJoin(projects, eq(documents.projectId, projects.id))
            .where(scopedDocumentCondition)
            .orderBy(desc(documents.uploadedAt))
            .limit(24),
      scopedProjectMemberCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: userTable.id,
              projectId: projectMembers.projectId,
              name: userTable.name,
              email: userTable.email,
              role: projectMembers.role,
              organization: userTable.organization,
            })
            .from(projectMembers)
            .innerJoin(userTable, eq(projectMembers.userId, userTable.id))
            .where(scopedProjectMemberCondition)
            .orderBy(asc(userTable.name)),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: workflowSteps.id,
              workflowId: documentWorkflows.id,
              documentId: documents.id,
              projectId: documents.projectId,
              documentNumber: documents.documentNumber,
              title: documents.title,
              projectName: projects.name,
              workflowName: documentWorkflows.workflowName,
              stepNumber: workflowSteps.stepNumber,
              totalSteps: documentWorkflows.totalSteps,
              stepName: workflowSteps.stepName,
              status: workflowSteps.status,
              assignedRole: workflowSteps.assignedRole,
              assignedToName: userTable.name,
              assignedToId: workflowSteps.assignedTo,
              dueDate: workflowSteps.dueDate,
              comments: workflowSteps.comments,
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
            .innerJoin(userTable, eq(workflowSteps.assignedTo, userTable.id))
            .where(scopedDocumentCondition)
            .orderBy(
              desc(documentWorkflows.startedAt),
              asc(workflowSteps.stepNumber),
            )
            .limit(24),
    ]);

    const [workflowCount] = workflowCountRows;
    const [pendingSteps] = pendingStepRows;
    const [approvedWorkflows] = approvedWorkflowRows;
    const [notificationCount] = notificationRows;

    return {
      metrics: [
        {
          label: "Active workflows",
          value: formatCount(workflowCount?.value),
          description:
            "Review routes currently registered against controlled documents.",
          tone: "emerald",
          icon: "reviews",
        },
        {
          label: "Pending actions",
          value: formatCount(pendingSteps?.value),
          description:
            "Reviewer and approver steps still waiting on a decision.",
          tone: "amber",
          icon: "reviews",
        },
        {
          label: "Approved routes",
          value: formatCount(approvedWorkflows?.value),
          description:
            "Workflows that completed successfully and released the document.",
          tone: "blue",
          icon: "documents",
        },
        {
          label: "Linked alerts",
          value: formatCount(notificationCount?.value),
          description:
            "Notifications associated with workflow activity in the workspace.",
          tone: "slate",
          icon: "notifications",
        },
      ],
      documents: documentRows.map((document) => ({
        id: String(document.id),
        projectId: String(document.projectId),
        documentNumber: document.documentNumber,
        title: document.title,
        projectName: document.projectName,
        status: document.status,
      })),
      assignees: assigneeRows.map((assignee) => ({
        id: assignee.id,
        projectId: String(assignee.projectId),
        name: assignee.name,
        email: assignee.email,
        role: assignee.role,
        organization: assignee.organization,
      })),
      steps: stepRows.map((step) => ({
        id: String(step.id),
        workflowId: String(step.workflowId),
        documentId: String(step.documentId),
        projectId: String(step.projectId),
        documentNumber: step.documentNumber,
        title: step.title,
        projectName: step.projectName,
        workflowName: step.workflowName,
        stepNumber: step.stepNumber,
        totalSteps: step.totalSteps,
        stepName: step.stepName,
        status: step.status,
        assignedRole: step.assignedRole,
        assignedToName: step.assignedToName,
        dueLabel: formatDateLabel(step.dueDate),
        comments: step.comments,
        isActionable: step.assignedToId === sessionUser.id,
      })),
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    return createFallbackWorkflowData(sessionUser, error);
  }
}

async function createFallbackWorkflowData(
  sessionUser: DashboardSessionUser,
  error: unknown,
): Promise<WorkflowManagementData> {
  const dashboard = await getEdmsDashboardData(sessionUser);

  return {
    metrics: [
      {
        label: "Active workflows",
        value: String(dashboard.workflowQueue.length),
        description: "Sample review routes while migrations are still pending.",
        tone: "emerald",
        icon: "reviews",
      },
      {
        label: "Pending actions",
        value: String(
          dashboard.workflowQueue.filter((item) =>
            ["pending", "in_progress"].includes(item.status),
          ).length,
        ),
        description: "Sample review and approval decisions still outstanding.",
        tone: "amber",
        icon: "reviews",
      },
      {
        label: "Approved routes",
        value: String(
          dashboard.documents.filter(
            (document) => document.status === "approved",
          ).length,
        ),
        description: "Sample approved workflow count in fallback mode.",
        tone: "blue",
        icon: "documents",
      },
      {
        label: "Linked alerts",
        value: String(dashboard.notifications.length),
        description: "Sample notifications connected to workflow activity.",
        tone: "slate",
        icon: "notifications",
      },
    ],
    documents: dashboard.documents.map((document, index) => ({
      id: document.id,
      projectId: `fallback-project-${index + 1}`,
      documentNumber: document.documentNumber,
      title: document.title,
      projectName: document.projectName,
      status: document.status,
    })),
    assignees: [
      {
        id: sessionUser.id,
        projectId: "fallback-project-1",
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
        organization: sessionUser.organization,
      },
      {
        id: "fallback-reviewer-2",
        projectId: "fallback-project-1",
        name: "Ayesha Karim",
        email: "ayesha.karim@example.com",
        role: "pmc",
        organization: "PMC Core",
      },
      {
        id: "fallback-reviewer-3",
        projectId: "fallback-project-1",
        name: "Nadia Islam",
        email: "nadia.islam@example.com",
        role: "client",
        organization: "Structura Developments",
      },
    ],
    steps: dashboard.workflowQueue.map((item, index) => ({
      id: item.id,
      workflowId: `fallback-workflow-${index + 1}`,
      documentId: `fallback-document-${index + 1}`,
      projectId: "fallback-project-1",
      documentNumber: item.documentNumber,
      title: item.title,
      projectName: item.projectName,
      workflowName: "Fallback review route",
      stepNumber: index + 1,
      totalSteps: Math.max(index + 1, 2),
      stepName: item.stepName,
      status: item.status,
      assignedRole: item.assignedRole,
      assignedToName: index === 0 ? sessionUser.name : "Ayesha Karim",
      dueLabel: item.dueLabel,
      comments: null,
      isActionable: index === 0,
    })),
    isUsingFallbackData: true,
    statusMessage: getFallbackMessage(error),
  };
}

function formatCount(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return "Due date pending";
  }

  return `Due ${formatStoredAbsoluteDate(date) ?? "date pending"}`;
}

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing sample workflow data while the live EDMS workspace is still being connected.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing sample workflow data because DATABASE_URL is not configured in this environment.";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    return "Showing sample workflow data until the EDMS database migrations are applied.";
  }

  return "Showing sample workflow data while the live EDMS workspace is still being connected.";
}
