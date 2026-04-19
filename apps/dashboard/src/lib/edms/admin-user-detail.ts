import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documentComments, documents } from "@/db/schema/documents";
import { activityLog } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { normalizeEdmsRole, requireEdmsRole } from "./rbac";

export interface AdminUserDetailData {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    organization: string | null;
    jobTitle: string | null;
    phone: string | null;
    department: string | null;
    isActive: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  stats: {
    documentsUploaded: number;
    workflowsCreated: number;
    workflowAssignments: number;
    commentsAdded: number;
    projectsAssigned: number;
    activityEntries: number;
  };
  activity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityName: string | null;
    description: string | null;
    createdAt: Date | null;
    projectName: string | null;
  }>;
  memberships: Array<{
    id: string;
    projectId: string;
    projectName: string;
    projectNumber: string | null;
    role: string;
    status: string;
    assignedAt: Date | null;
  }>;
  uploadedDocuments: Array<{
    id: string;
    title: string;
    documentNumber: string;
    revision: string | null;
    status: string;
    projectId: string;
    projectName: string;
    uploadedAt: Date | null;
  }>;
}

export async function getAdminUserDetailData(
  userId: string,
): Promise<AdminUserDetailData | null> {
  await requireEdmsRole("admin");

  const [profile] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      organization: userTable.organization,
      jobTitle: userTable.jobTitle,
      phone: userTable.phone,
      department: userTable.department,
      isActive: userTable.isActive,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!profile) {
    return null;
  }

  const [
    documentCount,
    workflowsCreatedCount,
    workflowAssignmentsCount,
    projectMembershipCount,
    commentCount,
    activityCountRow,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.uploadedBy, userId)),
    db
      .select({ value: count() })
      .from(documentWorkflows)
      .where(eq(documentWorkflows.createdBy, userId)),
    db
      .select({ value: count() })
      .from(workflowSteps)
      .where(eq(workflowSteps.assignedTo, userId)),
    db
      .select({ value: count() })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId)),
    db
      .select({ value: count() })
      .from(documentComments)
      .where(eq(documentComments.userId, userId)),
    db
      .select({ value: count() })
      .from(activityLog)
      .where(eq(activityLog.userId, userId)),
  ]);

  const [activityRows, membershipRows, uploadedDocumentRows] =
    await Promise.all([
      db
        .select({
          id: activityLog.id,
          action: activityLog.action,
          entityType: activityLog.entityType,
          entityName: activityLog.entityName,
          description: activityLog.description,
          createdAt: activityLog.createdAt,
          projectName: projects.name,
        })
        .from(activityLog)
        .leftJoin(projects, eq(activityLog.projectId, projects.id))
        .where(eq(activityLog.userId, userId))
        .orderBy(desc(activityLog.createdAt))
        .limit(12),
      db
        .select({
          id: projectMembers.id,
          projectId: projectMembers.projectId,
          projectName: projects.name,
          projectNumber: projects.projectNumber,
          role: projectMembers.role,
          status: projects.status,
          assignedAt: projectMembers.assignedAt,
        })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, userId))
        .orderBy(desc(projectMembers.assignedAt))
        .limit(12),
      db
        .select({
          id: documents.id,
          title: documents.title,
          documentNumber: documents.documentNumber,
          revision: documents.revision,
          status: documents.status,
          projectId: projects.id,
          projectName: projects.name,
          uploadedAt: documents.uploadedAt,
        })
        .from(documents)
        .innerJoin(projects, eq(documents.projectId, projects.id))
        .where(eq(documents.uploadedBy, userId))
        .orderBy(desc(documents.uploadedAt))
        .limit(12),
    ]);

  return {
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: normalizeEdmsRole(profile.role),
      organization: profile.organization,
      jobTitle: profile.jobTitle,
      phone: profile.phone,
      department: profile.department,
      isActive: Boolean(profile.isActive ?? true),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
    stats: {
      documentsUploaded: Number(documentCount[0]?.value ?? 0),
      workflowsCreated: Number(workflowsCreatedCount[0]?.value ?? 0),
      workflowAssignments: Number(workflowAssignmentsCount[0]?.value ?? 0),
      commentsAdded: Number(commentCount[0]?.value ?? 0),
      projectsAssigned: Number(projectMembershipCount[0]?.value ?? 0),
      activityEntries: Number(activityCountRow[0]?.value ?? 0),
    },
    activity: activityRows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityName: row.entityName,
      description: row.description,
      createdAt: row.createdAt,
      projectName: row.projectName,
    })),
    memberships: membershipRows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      projectName: row.projectName,
      projectNumber: row.projectNumber,
      role: row.role,
      status: row.status,
      assignedAt: row.assignedAt,
    })),
    uploadedDocuments: uploadedDocumentRows.map((row) => ({
      id: row.id,
      title: row.title,
      documentNumber: row.documentNumber,
      revision: row.revision,
      status: row.status,
      projectId: row.projectId,
      projectName: row.projectName,
      uploadedAt: row.uploadedAt,
    })),
  };
}
