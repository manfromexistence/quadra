"use server";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documentComments, documents } from "@/db/schema/documents";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { canAccessProject } from "@/lib/edms/access";
import { logEdmsActivity, notifyUsers } from "@/lib/edms/notifications";
import {
  actionFromError,
  actionOk,
  createEdmsId,
  mapDecisionToApprovalCode,
  requireActionSessionUser,
  requireManageEdmsContent,
} from "./_edms";

interface CreateDocumentWorkflowInput {
  documentId: string;
  workflowName: string;
  reviewUserId: string;
  reviewRole: string;
  approveUserId?: string;
  approveRole?: string;
  dueDate?: string;
}

interface RecordWorkflowDecisionInput {
  stepId: string;
  decision: "approve" | "approve_with_comments" | "reject" | "comment" | "for_information";
  comments?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentFileSize?: number;
}

export async function createDocumentWorkflow(input: CreateDocumentWorkflowInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    requireManageEdmsContent(sessionUser.role);

    const [documentSummary] = await db
      .select({
        id: documents.id,
        projectId: documents.projectId,
        title: documents.title,
        documentNumber: documents.documentNumber,
      })
      .from(documents)
      .where(eq(documents.id, input.documentId))
      .limit(1);

    if (!documentSummary) {
      throw new Error("Document not found.");
    }

    const hasProjectAccess = await canAccessProject(sessionUser, String(documentSummary.projectId));

    if (!hasProjectAccess) {
      throw new Error("You do not have access to this document.");
    }

    const now = new Date();
    const workflowId = createEdmsId("workflow");
    const stepEntries = [
      {
        id: createEdmsId("workflow-step"),
        workflowId,
        stepNumber: 1,
        stepName: "Review",
        assignedTo: input.reviewUserId,
        assignedRole: input.reviewRole,
        status: "in_progress",
        action: "review",
        startedAt: now,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
      ...(input.approveUserId
        ? [
            {
              id: createEdmsId("workflow-step"),
              workflowId,
              stepNumber: 2,
              stepName: "Approval",
              assignedTo: input.approveUserId,
              assignedRole: input.approveRole ?? null,
              status: "pending",
              action: "approve",
              startedAt: null,
              dueDate: input.dueDate ? new Date(input.dueDate) : null,
            },
          ]
        : []),
    ];

    await db.insert(documentWorkflows).values({
      id: workflowId,
      documentId: input.documentId,
      workflowName: input.workflowName.trim(),
      currentStep: 1,
      totalSteps: stepEntries.length,
      status: "in_progress",
      startedAt: now,
      createdBy: sessionUser.id,
    });

    await db.insert(workflowSteps).values(stepEntries);

    await db
      .update(documents)
      .set({
        status: "under_review",
        updatedAt: now,
        updatedBy: sessionUser.id,
      })
      .where(eq(documents.id, input.documentId));

    await notifyUsers({
      userIds: [input.reviewUserId],
      preferenceKey: "reviewRequest",
      type: "review_request",
      title: "New document review assigned",
      message: `${documentSummary.documentNumber} was routed to you for review.`,
      projectId: String(documentSummary.projectId),
      documentId: input.documentId,
      relatedEntityType: "workflow",
      relatedEntityId: workflowId,
      actionUrl: `/workflows/${workflowId}`,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: String(documentSummary.projectId),
      action: "workflow_created",
      entityType: "workflow",
      entityId: workflowId,
      entityName: input.workflowName.trim(),
      description: `Started workflow for ${documentSummary.documentNumber}.`,
    });

    revalidatePath("/workflows");
    revalidatePath("/documents");
    revalidatePath(`/documents/${input.documentId}`);

    return actionOk({
      id: workflowId,
    });
  } catch (error) {
    return actionFromError(error, "Unable to create the workflow.");
  }
}

export async function recordWorkflowDecision(input: RecordWorkflowDecisionInput) {
  try {
    const sessionUser = await requireActionSessionUser();

    const [stepSummary] = await db
      .select({
        id: workflowSteps.id,
        workflowId: workflowSteps.workflowId,
        stepName: workflowSteps.stepName,
        assignedTo: workflowSteps.assignedTo,
        documentId: documentWorkflows.documentId,
        workflowName: documentWorkflows.workflowName,
        totalSteps: documentWorkflows.totalSteps,
        projectId: documents.projectId,
        documentNumber: documents.documentNumber,
        uploadedBy: documents.uploadedBy,
        createdBy: documentWorkflows.createdBy,
      })
      .from(workflowSteps)
      .innerJoin(documentWorkflows, eq(workflowSteps.workflowId, documentWorkflows.id))
      .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
      .where(eq(workflowSteps.id, input.stepId))
      .limit(1);

    if (!stepSummary) {
      throw new Error("Workflow step not found.");
    }

    const hasProjectAccess = await canAccessProject(sessionUser, String(stepSummary.projectId));

    if (!hasProjectAccess) {
      throw new Error("You do not have access to this workflow.");
    }

    if (stepSummary.assignedTo !== sessionUser.id && sessionUser.role !== "admin") {
      throw new Error("Only the assigned reviewer can act on this step.");
    }

    const now = new Date();
    const normalizedComments = input.comments?.trim() || null;

    if (normalizedComments) {
      await db.insert(documentComments).values({
        id: createEdmsId("document-comment"),
        documentId: String(stepSummary.documentId),
        userId: sessionUser.id,
        comment: normalizedComments,
        commentType: "review",
        createdAt: now,
        updatedAt: now,
      });
    }

    if (input.decision === "comment") {
      await db
        .update(workflowSteps)
        .set({
          action: input.decision,
          comments: normalizedComments,
          approvalCode: mapDecisionToApprovalCode(input.decision),
          attachmentUrl: input.attachmentUrl ?? null,
          attachmentFileName: input.attachmentFileName ?? null,
          attachmentFileSize: input.attachmentFileSize ?? null,
          startedAt: now,
        })
        .where(eq(workflowSteps.id, input.stepId));

      revalidatePath("/workflows");
      revalidatePath(`/workflows/${stepSummary.workflowId}`);

      return actionOk({
        workflowId: String(stepSummary.workflowId),
      });
    }

    const completedStatus = input.decision === "reject" ? "rejected" : "completed";

    await db
      .update(workflowSteps)
      .set({
        status: completedStatus,
        action: input.decision,
        comments: normalizedComments,
        approvalCode: mapDecisionToApprovalCode(input.decision),
        attachmentUrl: input.attachmentUrl ?? null,
        attachmentFileName: input.attachmentFileName ?? null,
        attachmentFileSize: input.attachmentFileSize ?? null,
        completedAt: now,
        startedAt: now,
      })
      .where(eq(workflowSteps.id, input.stepId));

    const [nextStep] = await db
      .select({
        id: workflowSteps.id,
        stepNumber: workflowSteps.stepNumber,
        assignedTo: workflowSteps.assignedTo,
      })
      .from(workflowSteps)
      .where(
        and(
          eq(workflowSteps.workflowId, String(stepSummary.workflowId)),
          inArray(workflowSteps.status, ["pending"])
        )
      )
      .orderBy(asc(workflowSteps.stepNumber))
      .limit(1);

    if (input.decision === "reject") {
      await db
        .update(documentWorkflows)
        .set({
          status: "rejected",
          completedAt: now,
        })
        .where(eq(documentWorkflows.id, String(stepSummary.workflowId)));

      await db
        .update(documents)
        .set({
          status: "rejected",
          rejectedAt: now,
          rejectedBy: sessionUser.id,
          updatedAt: now,
          updatedBy: sessionUser.id,
        })
        .where(eq(documents.id, String(stepSummary.documentId)));
    } else if (nextStep) {
      await db
        .update(documentWorkflows)
        .set({
          currentStep: nextStep.stepNumber,
          status: "in_progress",
        })
        .where(eq(documentWorkflows.id, String(stepSummary.workflowId)));

      await db
        .update(workflowSteps)
        .set({
          status: "in_progress",
          startedAt: now,
        })
        .where(eq(workflowSteps.id, nextStep.id));

      await notifyUsers({
        userIds: [nextStep.assignedTo],
        preferenceKey: "reviewRequest",
        type: "review_request",
        title: "Workflow moved to your step",
        message: `${stepSummary.documentNumber} is now waiting on your action.`,
        projectId: String(stepSummary.projectId),
        documentId: String(stepSummary.documentId),
        relatedEntityType: "workflow",
        relatedEntityId: String(stepSummary.workflowId),
        actionUrl: `/workflows/${stepSummary.workflowId}`,
      });
    } else {
      await db
        .update(documentWorkflows)
        .set({
          status: "approved",
          completedAt: now,
          currentStep: stepSummary.totalSteps,
        })
        .where(eq(documentWorkflows.id, String(stepSummary.workflowId)));

      await db
        .update(documents)
        .set({
          status: "approved",
          approvedAt: now,
          approvedBy: sessionUser.id,
          updatedAt: now,
          updatedBy: sessionUser.id,
        })
        .where(eq(documents.id, String(stepSummary.documentId)));
    }

    const notificationTargets = Array.from(
      new Set([stepSummary.uploadedBy, stepSummary.createdBy].filter(Boolean))
    ) as string[];

    if (notificationTargets.length > 0) {
      await notifyUsers({
        userIds: notificationTargets,
        preferenceKey: "approvalDecision",
        type: "approval_decision",
        title: "Workflow decision recorded",
        message: `${stepSummary.documentNumber} received a ${input.decision.replaceAll("_", " ")} decision.`,
        projectId: String(stepSummary.projectId),
        documentId: String(stepSummary.documentId),
        relatedEntityType: "workflow",
        relatedEntityId: String(stepSummary.workflowId),
        actionUrl: `/workflows/${stepSummary.workflowId}`,
      });
    }

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: String(stepSummary.projectId),
      action: "workflow_decision_recorded",
      entityType: "workflow_step",
      entityId: input.stepId,
      entityName: stepSummary.stepName,
      description: `${input.decision.replaceAll("_", " ")} recorded for ${stepSummary.documentNumber}.`,
    });

    revalidatePath("/workflows");
    revalidatePath(`/workflows/${stepSummary.workflowId}`);
    revalidatePath(`/documents/${stepSummary.documentId}`);
    revalidatePath("/documents");

    return actionOk({
      workflowId: String(stepSummary.workflowId),
    });
  } catch (error) {
    return actionFromError(error, "Unable to record the workflow decision.");
  }
}
