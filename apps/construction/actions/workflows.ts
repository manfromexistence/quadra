"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { documentComments, documents } from "@/db/schema/documents";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { logEdmsActivity, notifyUsers } from "@/lib/edms/notifications";
import { requireEdmsRole } from "@/lib/edms/rbac";
import { logError } from "@/lib/shared";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const workflowDecisions = [
  "approve",
  "approve_with_comments",
  "reject",
  "comment",
  "for_information",
] as const;

// Approval codes mapping
const approvalCodeMap = {
  approve: 1,
  approve_with_comments: 2,
  reject: 3,
  for_information: 4,
} as const;

const createWorkflowSchema = z
  .object({
    documentId: z.string().uuid("Document selection is required."),
    workflowName: z.string().trim().min(2, "Workflow name is required.").max(255),
    reviewUserId: z.string().trim().min(1, "A reviewer is required."),
    reviewRole: z.string().trim().min(1, "A reviewer role is required.").max(50),
    approveUserId: z.string().trim().optional(),
    approveRole: z.string().trim().max(50).optional(),
    dueDate: z.string().trim().optional(),
  })
  .refine(
    (value) => {
      if (!value.approveUserId) {
        return true;
      }

      return Boolean(value.approveRole);
    },
    {
      message: "Approver role is required when a final approver is selected.",
      path: ["approveRole"],
    }
  );

const recordWorkflowDecisionSchema = z
  .object({
    stepId: z.string().uuid("Workflow step is required."),
    decision: z.enum(workflowDecisions),
    comments: z.string().trim().max(2000, "Comments are too long.").optional(),
    attachmentUrl: z.string().trim().url("Enter a valid attachment URL.").optional(),
    attachmentFileName: z.string().trim().max(500, "Attachment file name is too long.").optional(),
    attachmentFileSize: z.number().int().nonnegative().optional(),
  })
  .refine(
    (value) => {
      if (value.decision !== "comment") {
        return true;
      }

      return Boolean(value.comments && value.comments.trim().length > 0);
    },
    {
      message: "A comment is required when recording a review note.",
      path: ["comments"],
    }
  )
  .refine(
    (value) => {
      if (value.decision !== "approve_with_comments") {
        return true;
      }

      return Boolean(value.comments && value.comments.trim().length > 0);
    },
    {
      message: "Comments are required when approving with comments.",
      path: ["comments"],
    }
  );

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type RecordWorkflowDecisionInput = z.infer<typeof recordWorkflowDecisionSchema>;

interface WorkflowNotificationEffect {
  userIds: string[];
  preferenceKey: "reviewRequest" | "approvalDecision";
  type: string;
  title: string;
  message: string;
  actionUrl: string;
  emailSubject: string;
}

export async function createDocumentWorkflow(
  input: CreateWorkflowInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validation = createWorkflowSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid workflow data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("vendor");
    const values = validation.data;

    const documentRows = await db
      .select({
        id: documents.id,
        projectId: documents.projectId,
        documentNumber: documents.documentNumber,
        title: documents.title,
      })
      .from(documents)
      .where(eq(documents.id, values.documentId))
      .limit(1);

    const [documentRecord] = documentRows;

    if (!documentRecord) {
      return actionError(ErrorCode.VALIDATION_ERROR, "Selected document was not found.");
    }

    const activeWorkflowRows = await db
      .select({ id: documentWorkflows.id })
      .from(documentWorkflows)
      .where(
        and(
          eq(documentWorkflows.documentId, values.documentId),
          inArray(documentWorkflows.status, ["pending", "in_progress"])
        )
      )
      .limit(1);

    if (activeWorkflowRows[0]) {
      return actionError(
        ErrorCode.VALIDATION_ERROR,
        "This document already has an active workflow in progress."
      );
    }

    const workflowStepDefinitions: {
      stepNumber: number;
      stepName: string;
      assignedTo: string;
      assignedRole: string;
      status: "pending" | "in_progress";
    }[] = [
      {
        stepNumber: 1,
        stepName: "Technical review",
        assignedTo: values.reviewUserId,
        assignedRole: values.reviewRole,
        status: "in_progress" as const,
      },
    ];

    if (values.approveUserId) {
      workflowStepDefinitions.push({
        stepNumber: 2,
        stepName: "Final approval",
        assignedTo: values.approveUserId,
        assignedRole: values.approveRole ?? "client",
        status: "pending" as const,
      });
    }

    const now = new Date();

    // Insert workflow
    const [insertedWorkflow] = await db
      .insert(documentWorkflows)
      .values({
        documentId: values.documentId,
        workflowName: values.workflowName,
        currentStep: 1,
        totalSteps: workflowStepDefinitions.length,
        status: "in_progress",
        startedAt: now,
        createdBy: access.id,
      })
      .returning({ id: documentWorkflows.id });

    // Insert workflow steps
    await db.insert(workflowSteps).values(
      workflowStepDefinitions.map((step) => ({
        workflowId: insertedWorkflow.id,
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        assignedTo: step.assignedTo,
        assignedRole: step.assignedRole,
        status: step.status,
        startedAt: step.status === "in_progress" ? now : null,
        dueDate: parseOptionalDate(values.dueDate),
      }))
    );

    // Update document status
    await db
      .update(documents)
      .set({
        status: "under_review",
        updatedAt: now,
        updatedBy: access.id,
      })
      .where(eq(documents.id, values.documentId));

    const createdWorkflow = insertedWorkflow;

    await Promise.allSettled([
      notifyUsers({
        userIds: [values.reviewUserId].filter((userId) => userId !== access.id),
        preferenceKey: "reviewRequest",
        type: "review_request",
        title: `Review requested: ${documentRecord.documentNumber}`,
        message: `${documentRecord.title} has been routed to you for ${workflowStepDefinitions[0]?.stepName.toLowerCase()}.`,
        projectId: documentRecord.projectId,
        documentId: values.documentId,
        relatedEntityType: "workflow",
        relatedEntityId: createdWorkflow.id,
        actionUrl: "/dashboard/workflows",
        emailSubject: `QUADRA: review requested for ${documentRecord.documentNumber}`,
      }),
      logEdmsActivity({
        userId: access.id,
        projectId: documentRecord.projectId,
        action: "workflow_assigned",
        entityType: "workflow",
        entityId: createdWorkflow.id,
        entityName: values.workflowName,
        description: `${documentRecord.documentNumber} entered workflow routing with ${workflowStepDefinitions.length} step(s).`,
        metadata: {
          documentId: values.documentId,
          reviewerUserId: values.reviewUserId,
          approverUserId: values.approveUserId ?? null,
        },
      }),
    ]);

    revalidateWorkflowPaths(documentRecord.projectId);
    return actionSuccess({ id: createdWorkflow.id });
  } catch (error) {
    logError(error as Error, { action: "createDocumentWorkflow", input });

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      getWorkflowErrorMessage(error, "Failed to create workflow. Please try again.")
    );
  }
}

export async function recordWorkflowDecision(
  input: RecordWorkflowDecisionInput
): Promise<ActionResult<{ workflowId: string }>> {
  try {
    const validation = recordWorkflowDecisionSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid workflow decision.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("user");
    const values = validation.data;
    const now = new Date();
    let notificationEffect: WorkflowNotificationEffect | null = null;

    const stepRows = await db
      .select({
        id: workflowSteps.id,
        workflowId: workflowSteps.workflowId,
        stepNumber: workflowSteps.stepNumber,
        stepComments: workflowSteps.comments,
        assignedTo: workflowSteps.assignedTo,
        totalSteps: documentWorkflows.totalSteps,
        currentStep: documentWorkflows.currentStep,
        workflowStatus: documentWorkflows.status,
        documentId: documentWorkflows.documentId,
        workflowName: documentWorkflows.workflowName,
        createdBy: documentWorkflows.createdBy,
        projectId: documents.projectId,
        documentNumber: documents.documentNumber,
        documentTitle: documents.title,
        uploadedBy: documents.uploadedBy,
      })
      .from(workflowSteps)
      .innerJoin(documentWorkflows, eq(workflowSteps.workflowId, documentWorkflows.id))
      .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
      .where(eq(workflowSteps.id, values.stepId))
      .limit(1);

    const [stepRecord] = stepRows;

    if (!stepRecord) {
      return actionError(ErrorCode.VALIDATION_ERROR, "Workflow step was not found.");
    }

    if (stepRecord.workflowStatus === "approved" || stepRecord.workflowStatus === "rejected") {
      return actionError(ErrorCode.VALIDATION_ERROR, "This workflow has already been completed.");
    }

    if (stepRecord.assignedTo !== access.id && access.role !== "admin") {
      return actionError(
        ErrorCode.UNAUTHORIZED,
        "Only the assigned reviewer or an admin can complete this workflow step."
      );
    }

    // Handle comment-only decision
    if (values.decision === "comment") {
      await db.insert(documentComments).values({
        documentId: stepRecord.documentId,
        userId: access.id,
        comment: values.comments ?? "",
        commentType: "review",
        updatedAt: now,
      });

      await db
        .update(workflowSteps)
        .set({
          action: "comment",
          comments: mergeComments(stepRecord.stepComments, values.comments),
          attachmentUrl: values.attachmentUrl ?? null,
          attachmentFileName: values.attachmentFileName ?? null,
          attachmentFileSize: values.attachmentFileSize ?? null,
        })
        .where(eq(workflowSteps.id, stepRecord.id));

      await Promise.allSettled([
        notifyUsers({
          userIds: [stepRecord.createdBy, stepRecord.uploadedBy].filter(
            (userId) => userId !== access.id
          ),
          preferenceKey: "approvalDecision",
          type: "document_commented",
          title: `Comments received: ${stepRecord.documentNumber}`,
          message: `${stepRecord.documentTitle} received review comments and is waiting on your follow-up.`,
          projectId: stepRecord.projectId,
          documentId: stepRecord.documentId,
          relatedEntityType: "workflow",
          relatedEntityId: stepRecord.workflowId,
          actionUrl: `/dashboard/documents/${stepRecord.documentId}`,
          emailSubject: `QUADRA: comments received for ${stepRecord.documentNumber}`,
        }),
        logEdmsActivity({
          userId: access.id,
          projectId: stepRecord.projectId,
          action: "workflow_commented",
          entityType: "workflow",
          entityId: stepRecord.workflowId,
          entityName: stepRecord.workflowName,
          description: `${stepRecord.documentNumber} received review comments at step ${stepRecord.stepNumber}.`,
          metadata: {
            decision: values.decision,
            stepId: stepRecord.id,
            comments: values.comments ?? null,
            hasAttachment: Boolean(values.attachmentUrl),
          },
        }),
      ]);

      revalidateWorkflowPaths(stepRecord.projectId);
      return actionSuccess({ workflowId: stepRecord.workflowId });
    }

    // Handle for_information decision (Code-4)
    if (values.decision === "for_information") {
      await db.insert(documentComments).values({
        documentId: stepRecord.documentId,
        userId: access.id,
        comment: values.comments ?? "For information only",
        commentType: "review",
        updatedAt: now,
      });

      await db
        .update(workflowSteps)
        .set({
          status: "for_information",
          action: "for_information",
          approvalCode: approvalCodeMap.for_information,
          comments: mergeComments(stepRecord.stepComments, values.comments),
          attachmentUrl: values.attachmentUrl ?? null,
          attachmentFileName: values.attachmentFileName ?? null,
          attachmentFileSize: values.attachmentFileSize ?? null,
          completedAt: now,
        })
        .where(eq(workflowSteps.id, stepRecord.id));

      // For information doesn't complete the workflow, just logs it
      await Promise.allSettled([
        notifyUsers({
          userIds: [stepRecord.createdBy, stepRecord.uploadedBy].filter(
            (userId) => userId !== access.id
          ),
          preferenceKey: "approvalDecision",
          type: "document_for_information",
          title: `For information: ${stepRecord.documentNumber}`,
          message: `${stepRecord.documentTitle} was marked for information only.`,
          projectId: stepRecord.projectId,
          documentId: stepRecord.documentId,
          relatedEntityType: "workflow",
          relatedEntityId: stepRecord.workflowId,
          actionUrl: `/dashboard/documents/${stepRecord.documentId}`,
          emailSubject: `QUADRA: ${stepRecord.documentNumber} - for information`,
        }),
        logEdmsActivity({
          userId: access.id,
          projectId: stepRecord.projectId,
          action: "workflow_for_information",
          entityType: "workflow",
          entityId: stepRecord.workflowId,
          entityName: stepRecord.workflowName,
          description: `${stepRecord.documentNumber} was marked for information only at step ${stepRecord.stepNumber}.`,
          metadata: {
            decision: values.decision,
            approvalCode: 4,
            stepId: stepRecord.id,
            comments: values.comments ?? null,
            hasAttachment: Boolean(values.attachmentUrl),
          },
        }),
      ]);

      revalidateWorkflowPaths(stepRecord.projectId);
      return actionSuccess({ workflowId: stepRecord.workflowId });
    }

    // Handle approve/reject decision
    const resolvedStepStatus =
      values.decision === "approve"
        ? "approved"
        : values.decision === "approve_with_comments"
          ? "approved_with_comments"
          : "rejected";

    const approvalCode =
      values.decision === "approve"
        ? approvalCodeMap.approve
        : values.decision === "approve_with_comments"
          ? approvalCodeMap.approve_with_comments
          : approvalCodeMap.reject;

    await db
      .update(workflowSteps)
      .set({
        status: resolvedStepStatus,
        action: values.decision,
        approvalCode,
        comments: mergeComments(stepRecord.stepComments, values.comments),
        attachmentUrl: values.attachmentUrl ?? null,
        attachmentFileName: values.attachmentFileName ?? null,
        attachmentFileSize: values.attachmentFileSize ?? null,
        completedAt: now,
      })
      .where(eq(workflowSteps.id, stepRecord.id));

    if (values.decision === "reject") {
      await db
        .update(documentWorkflows)
        .set({
          status: "rejected",
          completedAt: now,
        })
        .where(eq(documentWorkflows.id, stepRecord.workflowId));

      await db
        .update(documents)
        .set({
          status: "rejected",
          rejectedAt: now,
          rejectedBy: access.id,
          updatedAt: now,
          updatedBy: access.id,
        })
        .where(eq(documents.id, stepRecord.documentId));

      notificationEffect = {
        userIds: [stepRecord.createdBy, stepRecord.uploadedBy].filter(
          (userId) => userId !== access.id
        ),
        preferenceKey: "approvalDecision",
        type: "document_rejected",
        title: `Document rejected: ${stepRecord.documentNumber}`,
        message: `${stepRecord.documentTitle} was rejected during workflow review.`,
        actionUrl: `/dashboard/documents/${stepRecord.documentId}`,
        emailSubject: `QUADRA: ${stepRecord.documentNumber} rejected`,
      };
    } else {
      // Handle approve or approve_with_comments decision - check for next step
      const nextStepRows = await db
        .select({
          id: workflowSteps.id,
          assignedTo: workflowSteps.assignedTo,
          stepName: workflowSteps.stepName,
        })
        .from(workflowSteps)
        .where(
          and(
            eq(workflowSteps.workflowId, stepRecord.workflowId),
            eq(workflowSteps.stepNumber, stepRecord.stepNumber + 1)
          )
        )
        .orderBy(asc(workflowSteps.stepNumber))
        .limit(1);

      const [nextStep] = nextStepRows;

      if (nextStep) {
        // Advance to next step
        await db
          .update(workflowSteps)
          .set({
            status: "in_progress",
            startedAt: now,
          })
          .where(eq(workflowSteps.id, nextStep.id));

        await db
          .update(documentWorkflows)
          .set({
            currentStep: stepRecord.currentStep + 1,
            status: "in_progress",
          })
          .where(eq(documentWorkflows.id, stepRecord.workflowId));

        await db
          .update(documents)
          .set({
            status: "under_review",
            updatedAt: now,
            updatedBy: access.id,
          })
          .where(eq(documents.id, stepRecord.documentId));

        notificationEffect = {
          userIds: [nextStep.assignedTo].filter((userId) => userId !== access.id),
          preferenceKey: "reviewRequest",
          type: "review_request",
          title: `Review requested: ${stepRecord.documentNumber}`,
          message: `${stepRecord.documentTitle} has advanced to ${nextStep.stepName.toLowerCase()}.`,
          actionUrl: "/dashboard/workflows",
          emailSubject: `QUADRA: next review step for ${stepRecord.documentNumber}`,
        };
      } else {
        // No next step - workflow is complete and approved
        await db
          .update(documentWorkflows)
          .set({
            currentStep: stepRecord.totalSteps,
            status: "approved",
            completedAt: now,
          })
          .where(eq(documentWorkflows.id, stepRecord.workflowId));

        await db
          .update(documents)
          .set({
            status: "approved",
            approvedAt: now,
            approvedBy: access.id,
            updatedAt: now,
            updatedBy: access.id,
          })
          .where(eq(documents.id, stepRecord.documentId));

        notificationEffect = {
          userIds: [stepRecord.createdBy, stepRecord.uploadedBy].filter(
            (userId) => userId !== access.id
          ),
          preferenceKey: "approvalDecision",
          type: "document_approved",
          title: `Document approved: ${stepRecord.documentNumber}`,
          message: `${stepRecord.documentTitle} completed the workflow and is now approved.`,
          actionUrl: `/dashboard/documents/${stepRecord.documentId}`,
          emailSubject: `QUADRA: ${stepRecord.documentNumber} approved`,
        };
      }
    }

    let notificationPromise: Promise<void>;

    if (notificationEffect) {
      const effect = notificationEffect as WorkflowNotificationEffect;
      notificationPromise = notifyUsers({
        userIds: effect.userIds,
        preferenceKey: effect.preferenceKey,
        type: effect.type,
        title: effect.title,
        message: effect.message,
        projectId: stepRecord.projectId,
        documentId: stepRecord.documentId,
        relatedEntityType: "workflow",
        relatedEntityId: stepRecord.workflowId,
        actionUrl: effect.actionUrl,
        emailSubject: effect.emailSubject,
      });
    } else {
      notificationPromise = Promise.resolve();
    }

    await Promise.allSettled([
      notificationPromise,
      logEdmsActivity({
        userId: access.id,
        projectId: stepRecord.projectId,
        action:
          values.decision === "approve"
            ? "workflow_approved"
            : values.decision === "approve_with_comments"
              ? "workflow_approved_with_comments"
              : "workflow_rejected",
        entityType: "workflow",
        entityId: stepRecord.workflowId,
        entityName: stepRecord.workflowName,
        description: `${stepRecord.documentNumber} received a ${values.decision.replace(/_/g, " ")} decision at step ${stepRecord.stepNumber}.`,
        metadata: {
          decision: values.decision,
          approvalCode,
          stepId: stepRecord.id,
          comments: values.comments ?? null,
          hasAttachment: Boolean(values.attachmentUrl),
          attachmentFileName: values.attachmentFileName ?? null,
        },
      }),
    ]);

    revalidateWorkflowPaths(stepRecord.projectId);
    return actionSuccess({ workflowId: stepRecord.workflowId });
  } catch (error) {
    logError(error as Error, { action: "recordWorkflowDecision", input });

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      getWorkflowErrorMessage(error, "Failed to update the workflow. Please try again.")
    );
  }
}

function revalidateWorkflowPaths(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/workflows");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

function parseOptionalDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

function mergeComments(existing: string | null, next: string | undefined) {
  if (!next || next.trim().length === 0) {
    return existing;
  }

  if (!existing || existing.trim().length === 0) {
    return next.trim();
  }

  return `${existing}\n\n${next.trim()}`;
}

function getWorkflowErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (error.message.includes("does not exist")) {
    return "Workflow tables are not available yet. Run the EDMS migrations before routing reviews.";
  }

  if (error.message.includes("Insufficient permissions")) {
    return "Your role is not allowed to route or decide workflow steps.";
  }

  return fallback;
}
