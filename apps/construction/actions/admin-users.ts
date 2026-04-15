"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { session, subscription, user as userTable } from "@/db/schema";
import { documentComments, documents, documentVersions } from "@/db/schema/documents";
import { activityLog, notifications } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { logEdmsActivity } from "@/lib/edms/notifications";
import { type EdmsRole, normalizeEdmsRole, requireEdmsRole } from "@/lib/edms/rbac";
import { logError } from "@/lib/shared";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const userRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required."),
  role: z.enum(userRoles),
});

const updateUserDetailsSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required."),
  organization: z.string().trim().max(255, "Organization is too long.").optional(),
  jobTitle: z.string().trim().max(255, "Job title is too long.").optional(),
  phone: z.string().trim().max(50, "Phone is too long.").optional(),
  department: z.string().trim().max(255, "Department is too long.").optional(),
});

const toggleUserStatusSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required."),
  isActive: z.boolean(),
});

const deleteUserSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required."),
});

const bulkRoleUpdateSchema = z.object({
  updates: z
    .array(updateUserRoleSchema)
    .min(1, "Select at least one user to change roles.")
    .max(100, "Bulk role updates are limited to 100 users at a time."),
});

const bulkStatusToggleSchema = z.object({
  userIds: z
    .array(z.string().trim().min(1, "User ID is required."))
    .min(1, "Select at least one user to change status.")
    .max(100, "Bulk status updates are limited to 100 users at a time."),
  isActive: z.boolean(),
});

const bulkDeleteSchema = z.object({
  userIds: z
    .array(z.string().trim().min(1, "User ID is required."))
    .min(1, "Select at least one user to delete.")
    .max(50, "Bulk deletion is limited to 50 users at a time."),
});

export interface UserActivitySummary {
  documentsUploaded: number;
  workflowAssignments: number;
  workflowsCreated: number;
  commentsAdded: number;
  projectsAssigned: number;
  notificationsReceived: number;
  activityEntries: number;
  lastSeenAt: Date | null;
}

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserDetailsInput = z.infer<typeof updateUserDetailsSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;

export async function bulkUpdateUserRoles(
  updates: UpdateUserRoleInput[]
): Promise<ActionResult<number>> {
  try {
    const validation = bulkRoleUpdateSchema.safeParse({ updates });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid bulk role update request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    let updatedCount = 0;

    for (const update of validation.data.updates) {
      const result = await updateUserRole(update);

      if (!result.success) {
        return actionError(result.error.code, result.error.message);
      }

      updatedCount += 1;
    }

    return actionSuccess(updatedCount);
  } catch (error) {
    logError(error as Error, { action: "bulkUpdateUserRoles", updates });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update the selected user roles.");
  }
}

export async function bulkToggleUserStatus(input: {
  userIds: string[];
  isActive: boolean;
}): Promise<ActionResult<number>> {
  try {
    const validation = bulkStatusToggleSchema.safeParse(input);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message ?? "Invalid bulk status update request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    let updatedCount = 0;

    for (const userId of validation.data.userIds) {
      const result = await toggleUserStatus({
        userId,
        isActive: validation.data.isActive,
      });

      if (!result.success) {
        return actionError(result.error.code, result.error.message);
      }

      updatedCount += 1;
    }

    return actionSuccess(updatedCount);
  } catch (error) {
    logError(error as Error, { action: "bulkToggleUserStatus", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update the selected users.");
  }
}

export async function bulkDeleteUsers(userIds: string[]): Promise<ActionResult<number>> {
  try {
    const validation = bulkDeleteSchema.safeParse({ userIds });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid bulk delete request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    let deletedCount = 0;

    for (const userId of validation.data.userIds) {
      const result = await deleteUser(userId);

      if (!result.success) {
        return actionError(result.error.code, result.error.message);
      }

      deletedCount += 1;
    }

    return actionSuccess(deletedCount);
  } catch (error) {
    logError(error as Error, { action: "bulkDeleteUsers", userIds });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to delete the selected users.");
  }
}

export async function updateUserRole(input: UpdateUserRoleInput): Promise<ActionResult<boolean>> {
  try {
    const validation = updateUserRoleSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid role update request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const { userId, role } = validation.data;

    if (userId === access.id && role !== "admin") {
      return actionError(ErrorCode.VALIDATION_ERROR, "You cannot demote your own admin account.");
    }

    const [targetUser] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        role: userTable.role,
        isActive: userTable.isActive,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!targetUser) {
      return actionError(ErrorCode.VALIDATION_ERROR, "User not found.");
    }

    const previousRole = normalizeEdmsRole(targetUser.role);

    if (previousRole === role) {
      return actionSuccess(true);
    }

    if (previousRole === "admin" && role !== "admin") {
      const adminCount = await countActiveAdmins();

      if (adminCount <= 1 && Boolean(targetUser.isActive ?? true)) {
        return actionError(
          ErrorCode.VALIDATION_ERROR,
          "At least one active admin must remain in the system."
        );
      }
    }

    await db
      .update(userTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    await logEdmsActivity({
      userId: access.id,
      action: "user_role_updated",
      entityType: "user",
      entityId: userId,
      entityName: targetUser.name,
      description: `Changed ${targetUser.name} from ${previousRole} to ${role}.`,
      metadata: {
        previousRole,
        nextRole: role,
      },
    });

    revalidateAdminUsers(userId);
    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "updateUserRole", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update the user role.");
  }
}

export async function updateUserDetails(
  input: UpdateUserDetailsInput
): Promise<ActionResult<boolean>> {
  try {
    const validation = updateUserDetailsSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid user details.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const { userId, organization, jobTitle, phone, department } = validation.data;

    const [targetUser] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        organization: userTable.organization,
        jobTitle: userTable.jobTitle,
        phone: userTable.phone,
        department: userTable.department,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!targetUser) {
      return actionError(ErrorCode.VALIDATION_ERROR, "User not found.");
    }

    const normalizedUpdates = {
      organization: normalizeOptional(organization),
      jobTitle: normalizeOptional(jobTitle),
      phone: normalizeOptional(phone),
      department: normalizeOptional(department),
    };

    await db
      .update(userTable)
      .set({
        ...normalizedUpdates,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    await logEdmsActivity({
      userId: access.id,
      action: "user_details_updated",
      entityType: "user",
      entityId: userId,
      entityName: targetUser.name,
      description: `Updated profile details for ${targetUser.name}.`,
      metadata: {
        before: {
          organization: targetUser.organization,
          jobTitle: targetUser.jobTitle,
          phone: targetUser.phone,
          department: targetUser.department,
        },
        after: normalizedUpdates,
      },
    });

    revalidateAdminUsers(userId);
    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "updateUserDetails", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update the user details.");
  }
}

export async function toggleUserStatus(
  input: ToggleUserStatusInput
): Promise<ActionResult<boolean>> {
  try {
    const validation = toggleUserStatusSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid user status update.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const { userId, isActive } = validation.data;

    if (userId === access.id && !isActive) {
      return actionError(ErrorCode.VALIDATION_ERROR, "You cannot deactivate your own account.");
    }

    const [targetUser] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        role: userTable.role,
        isActive: userTable.isActive,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!targetUser) {
      return actionError(ErrorCode.VALIDATION_ERROR, "User not found.");
    }

    const currentRole = normalizeEdmsRole(targetUser.role);
    const currentStatus = Boolean(targetUser.isActive ?? true);

    if (currentStatus === isActive) {
      return actionSuccess(true);
    }

    if (currentRole === "admin" && !isActive) {
      const adminCount = await countActiveAdmins();

      if (adminCount <= 1 && currentStatus) {
        return actionError(
          ErrorCode.VALIDATION_ERROR,
          "At least one active admin must remain in the system."
        );
      }
    }

    await db
      .update(userTable)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    await logEdmsActivity({
      userId: access.id,
      action: isActive ? "user_activated" : "user_deactivated",
      entityType: "user",
      entityId: userId,
      entityName: targetUser.name,
      description: `${targetUser.name} was ${isActive ? "activated" : "deactivated"}.`,
      metadata: {
        previousStatus: currentStatus,
        nextStatus: isActive,
      },
    });

    revalidateAdminUsers(userId);
    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "toggleUserStatus", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update the user status.");
  }
}

export async function deleteUser(userId: string): Promise<ActionResult<boolean>> {
  try {
    const validation = deleteUserSchema.safeParse({ userId });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid user deletion request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const targetUserId = validation.data.userId;

    if (targetUserId === access.id) {
      return actionError(
        ErrorCode.VALIDATION_ERROR,
        "Use your own account settings if you need to delete your admin account."
      );
    }

    const [targetUser] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        role: userTable.role,
        isActive: userTable.isActive,
      })
      .from(userTable)
      .where(eq(userTable.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return actionError(ErrorCode.VALIDATION_ERROR, "User not found.");
    }

    if (normalizeEdmsRole(targetUser.role) === "admin" && Boolean(targetUser.isActive ?? true)) {
      const adminCount = await countActiveAdmins();

      if (adminCount <= 1) {
        return actionError(
          ErrorCode.VALIDATION_ERROR,
          "At least one active admin must remain in the system."
        );
      }
    }

    await db.transaction(async (tx) => {
      const now = new Date();

      await tx
        .update(documents)
        .set({
          uploadedBy: access.id,
          updatedBy: access.id,
          updatedAt: now,
        })
        .where(eq(documents.uploadedBy, targetUserId));

      await tx
        .update(documents)
        .set({
          updatedBy: access.id,
          updatedAt: now,
        })
        .where(eq(documents.updatedBy, targetUserId));

      await tx
        .update(documents)
        .set({
          approvedBy: access.id,
          updatedAt: now,
        })
        .where(eq(documents.approvedBy, targetUserId));

      await tx
        .update(documents)
        .set({
          rejectedBy: access.id,
          updatedAt: now,
        })
        .where(eq(documents.rejectedBy, targetUserId));

      await tx
        .update(documentVersions)
        .set({
          uploadedBy: access.id,
        })
        .where(eq(documentVersions.uploadedBy, targetUserId));

      await tx.delete(documentComments).where(eq(documentComments.userId, targetUserId));

      await tx
        .update(documentWorkflows)
        .set({
          createdBy: access.id,
        })
        .where(eq(documentWorkflows.createdBy, targetUserId));

      await tx
        .update(workflowSteps)
        .set({
          assignedTo: access.id,
        })
        .where(eq(workflowSteps.assignedTo, targetUserId));

      await tx
        .update(projects)
        .set({
          clientId: access.id,
          updatedAt: now,
        })
        .where(eq(projects.clientId, targetUserId));

      await tx
        .update(projects)
        .set({
          createdBy: access.id,
          updatedAt: now,
        })
        .where(eq(projects.createdBy, targetUserId));

      await tx.delete(projectMembers).where(eq(projectMembers.userId, targetUserId));

      await tx
        .update(projectMembers)
        .set({
          assignedBy: access.id,
        })
        .where(eq(projectMembers.assignedBy, targetUserId));

      await tx.delete(notifications).where(eq(notifications.userId, targetUserId));
      await tx.delete(activityLog).where(eq(activityLog.userId, targetUserId));
      await tx.delete(subscription).where(eq(subscription.userId, targetUserId));
      await tx.delete(session).where(eq(session.userId, targetUserId));
      await tx.delete(userTable).where(eq(userTable.id, targetUserId));
    });

    await logEdmsActivity({
      userId: access.id,
      action: "user_deleted",
      entityType: "user",
      entityId: targetUserId,
      entityName: targetUser.name,
      description: `${targetUser.name} was deleted from the QUADRA workspace.`,
      metadata: {
        deletedRole: normalizeEdmsRole(targetUser.role),
      },
    });

    revalidateAdminUsers(targetUserId);
    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "deleteUser", userId });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to delete the user account.");
  }
}

export async function getUserActivitySummary(
  userId: string
): Promise<ActionResult<UserActivitySummary>> {
  try {
    const validation = deleteUserSchema.safeParse({ userId });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid user summary request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    await requireEdmsRole("admin");
    const targetUserId = validation.data.userId;

    const [
      documentCount,
      workflowAssignmentCount,
      workflowCreatedCount,
      commentCount,
      projectMemberCount,
      notificationCount,
      activityCount,
      recentSession,
    ] = await Promise.all([
      db.select({ value: count() }).from(documents).where(eq(documents.uploadedBy, targetUserId)),
      db
        .select({ value: count() })
        .from(workflowSteps)
        .where(eq(workflowSteps.assignedTo, targetUserId)),
      db
        .select({ value: count() })
        .from(documentWorkflows)
        .where(eq(documentWorkflows.createdBy, targetUserId)),
      db
        .select({ value: count() })
        .from(documentComments)
        .where(eq(documentComments.userId, targetUserId)),
      db
        .select({ value: count() })
        .from(projectMembers)
        .where(eq(projectMembers.userId, targetUserId)),
      db
        .select({ value: count() })
        .from(notifications)
        .where(eq(notifications.userId, targetUserId)),
      db.select({ value: count() }).from(activityLog).where(eq(activityLog.userId, targetUserId)),
      db
        .select({ expiresAt: session.expiresAt })
        .from(session)
        .where(eq(session.userId, targetUserId))
        .limit(1),
    ]);

    return actionSuccess({
      documentsUploaded: toCount(documentCount[0]?.value),
      workflowAssignments: toCount(workflowAssignmentCount[0]?.value),
      workflowsCreated: toCount(workflowCreatedCount[0]?.value),
      commentsAdded: toCount(commentCount[0]?.value),
      projectsAssigned: toCount(projectMemberCount[0]?.value),
      notificationsReceived: toCount(notificationCount[0]?.value),
      activityEntries: toCount(activityCount[0]?.value),
      lastSeenAt: recentSession[0]?.expiresAt ?? null,
    });
  } catch (error) {
    logError(error as Error, { action: "getUserActivitySummary", userId });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to load the user activity summary.");
  }
}

async function countActiveAdmins() {
  const [adminCount] = await db
    .select({ value: count() })
    .from(userTable)
    .where(and(eq(userTable.role, "admin"), eq(userTable.isActive, true)));

  return toCount(adminCount?.value);
}

function normalizeOptional(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toCount(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function revalidateAdminUsers(userId: string) {
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);
}
