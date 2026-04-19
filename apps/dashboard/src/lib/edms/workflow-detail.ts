import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { canAccessProject } from "./access";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface WorkflowDetailData {
  workflow: {
    id: string;
    workflowName: string;
    status: string;
    currentStep: number;
    totalSteps: number;
    startedLabel: string;
    completedLabel: string;
    documentId: string;
    documentNumber: string;
    documentTitle: string;
    projectId: string;
    projectName: string;
  };
  steps: Array<{
    id: string;
    stepNumber: number;
    stepName: string;
    assignedToName: string;
    assignedRole: string | null;
    status: string;
    comments: string | null;
    dueLabel: string;
    completedLabel: string;
    isActionable: boolean;
  }>;
}

export async function getWorkflowDetailData(
  workflowId: string,
  sessionUser: DashboardSessionUser,
): Promise<WorkflowDetailData | null> {
  const [workflow] = await db
    .select({
      id: documentWorkflows.id,
      workflowName: documentWorkflows.workflowName,
      status: documentWorkflows.status,
      currentStep: documentWorkflows.currentStep,
      totalSteps: documentWorkflows.totalSteps,
      startedAt: documentWorkflows.startedAt,
      completedAt: documentWorkflows.completedAt,
      documentId: documents.id,
      documentNumber: documents.documentNumber,
      documentTitle: documents.title,
      projectId: projects.id,
      projectName: projects.name,
    })
    .from(documentWorkflows)
    .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
    .innerJoin(projects, eq(documents.projectId, projects.id))
    .where(eq(documentWorkflows.id, workflowId))
    .limit(1);

  if (!workflow) {
    return null;
  }

  const hasProjectAccess = await canAccessProject(
    sessionUser,
    String(workflow.projectId),
  );

  if (!hasProjectAccess) {
    return null;
  }

  const stepRows = await db
    .select({
      id: workflowSteps.id,
      stepNumber: workflowSteps.stepNumber,
      stepName: workflowSteps.stepName,
      assignedToName: userTable.name,
      assignedTo: workflowSteps.assignedTo,
      assignedRole: workflowSteps.assignedRole,
      status: workflowSteps.status,
      comments: workflowSteps.comments,
      dueDate: workflowSteps.dueDate,
      completedAt: workflowSteps.completedAt,
    })
    .from(workflowSteps)
    .leftJoin(userTable, eq(workflowSteps.assignedTo, userTable.id))
    .where(eq(workflowSteps.workflowId, workflowId))
    .orderBy(asc(workflowSteps.stepNumber));

  return {
    workflow: {
      id: workflow.id,
      workflowName: workflow.workflowName,
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps: workflow.totalSteps,
      startedLabel: formatDateLabel(workflow.startedAt, "Started"),
      completedLabel: formatDateLabel(workflow.completedAt, "Completed"),
      documentId: workflow.documentId,
      documentNumber: workflow.documentNumber,
      documentTitle: workflow.documentTitle,
      projectId: workflow.projectId,
      projectName: workflow.projectName,
    },
    steps: stepRows.map((step) => ({
      id: step.id,
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      assignedToName: step.assignedToName ?? "Unassigned",
      assignedRole: step.assignedRole,
      status: step.status,
      comments: step.comments,
      dueLabel: formatDateLabel(step.dueDate, "Due"),
      completedLabel: formatDateLabel(step.completedAt, "Completed"),
      isActionable: step.assignedTo === sessionUser.id,
    })),
  };
}

function formatDateLabel(date: Date | null, prefix: string) {
  if (!date) {
    return `${prefix} pending`;
  }

  return `${prefix} ${formatStoredAbsoluteDate(date) ?? "date pending"}`;
}
