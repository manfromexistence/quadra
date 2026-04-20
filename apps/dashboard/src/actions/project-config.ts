"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  disciplines,
  documentTypes,
  projectConfig,
  stakeholders,
  workflowStepTemplates,
} from "@/db/schema";
import { requireActionSessionUser } from "@/lib/edms/session";

// Get project configuration
export async function getProjectConfig(projectId: string) {
  const _sessionUser = await requireActionSessionUser();

  const config = await db.query.projectConfig.findFirst({
    where: eq(projectConfig.projectId, projectId),
  });

  return config;
}

// Update project configuration
export async function updateProjectConfig(data: {
  projectId: string;
  projectCode: string;
  shortCode: string;
  client?: string;
  contractor?: string;
  currency?: string;
  numberingPattern: string;
  sequencePadding: number;
  separator: string;
  revisionScheme: string;
  sequenceReset: string;
  defaultReviewSla?: string;
  reminderBeforeDue?: number;
  overdueEscalation?: string;
  autoCloseAfter?: string;
}) {
  const sessionUser = await requireActionSessionUser();

  const existing = await db.query.projectConfig.findFirst({
    where: eq(projectConfig.projectId, data.projectId),
  });

  if (existing) {
    await db
      .update(projectConfig)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projectConfig.id, existing.id));
  } else {
    await db.insert(projectConfig).values({
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: sessionUser.id,
    });
  }

  revalidatePath("/config");
  return { success: true };
}

// Get disciplines for a project
export async function getDisciplines(projectId: string) {
  const _sessionUser = await requireActionSessionUser();

  const result = await db.query.disciplines.findMany({
    where: and(
      eq(disciplines.projectId, projectId),
      eq(disciplines.isActive, true),
    ),
    orderBy: (disciplines, { asc }) => [asc(disciplines.sortOrder)],
  });

  return result;
}

// Add discipline
export async function addDiscipline(data: {
  projectId: string;
  code: string;
  name: string;
  color: string;
  sortOrder?: number;
}) {
  const _sessionUser = await requireActionSessionUser();

  await db.insert(disciplines).values({
    id: nanoid(),
    ...data,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/config");
  return { success: true };
}

// Update discipline
export async function updateDiscipline(
  id: string,
  data: {
    code?: string;
    name?: string;
    color?: string;
    sortOrder?: number;
  },
) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(disciplines)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(disciplines.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Delete discipline
export async function deleteDiscipline(id: string) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(disciplines)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(disciplines.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Get document types for a project
export async function getDocumentTypes(projectId: string) {
  const _sessionUser = await requireActionSessionUser();

  const result = await db.query.documentTypes.findMany({
    where: and(
      eq(documentTypes.projectId, projectId),
      eq(documentTypes.isActive, true),
    ),
    orderBy: (documentTypes, { asc }) => [asc(documentTypes.sortOrder)],
  });

  return result;
}

// Add document type
export async function addDocumentType(data: {
  projectId: string;
  code: string;
  name: string;
  sortOrder?: number;
}) {
  const _sessionUser = await requireActionSessionUser();

  await db.insert(documentTypes).values({
    id: nanoid(),
    ...data,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/config");
  return { success: true };
}

// Update document type
export async function updateDocumentType(
  id: string,
  data: {
    code?: string;
    name?: string;
    sortOrder?: number;
  },
) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(documentTypes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documentTypes.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Delete document type
export async function deleteDocumentType(id: string) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(documentTypes)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(documentTypes.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Get stakeholders for a project
export async function getStakeholders(projectId: string) {
  const _sessionUser = await requireActionSessionUser();

  const result = await db.query.stakeholders.findMany({
    where: and(
      eq(stakeholders.projectId, projectId),
      eq(stakeholders.isActive, true),
    ),
    orderBy: (stakeholders, { asc }) => [asc(stakeholders.sortOrder)],
  });

  return result;
}

// Add stakeholder
export async function addStakeholder(data: {
  projectId: string;
  stakeholderId: string;
  name: string;
  role: string;
  contact?: string;
  sortOrder?: number;
}) {
  const _sessionUser = await requireActionSessionUser();

  await db.insert(stakeholders).values({
    id: nanoid(),
    ...data,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/config");
  return { success: true };
}

// Update stakeholder
export async function updateStakeholder(
  id: string,
  data: {
    stakeholderId?: string;
    name?: string;
    role?: string;
    contact?: string;
    sortOrder?: number;
  },
) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(stakeholders)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(stakeholders.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Delete stakeholder
export async function deleteStakeholder(id: string) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(stakeholders)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(stakeholders.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Get workflow step templates for a project
export async function getWorkflowStepTemplates(projectId: string) {
  const _sessionUser = await requireActionSessionUser();

  const result = await db.query.workflowStepTemplates.findMany({
    where: and(
      eq(workflowStepTemplates.projectId, projectId),
      eq(workflowStepTemplates.isActive, true),
    ),
    orderBy: (workflowStepTemplates, { asc }) => [
      asc(workflowStepTemplates.sortOrder),
    ],
  });

  return result;
}

// Add workflow step template
export async function addWorkflowStepTemplate(data: {
  projectId: string;
  stepName: string;
  actor: string;
  duration: string;
  sortOrder?: number;
}) {
  const _sessionUser = await requireActionSessionUser();

  await db.insert(workflowStepTemplates).values({
    id: nanoid(),
    ...data,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/config");
  return { success: true };
}

// Update workflow step template
export async function updateWorkflowStepTemplate(
  id: string,
  data: {
    stepName?: string;
    actor?: string;
    duration?: string;
    sortOrder?: number;
  },
) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(workflowStepTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workflowStepTemplates.id, id));

  revalidatePath("/config");
  return { success: true };
}

// Delete workflow step template
export async function deleteWorkflowStepTemplate(id: string) {
  const _sessionUser = await requireActionSessionUser();

  await db
    .update(workflowStepTemplates)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(workflowStepTemplates.id, id));

  revalidatePath("/config");
  return { success: true };
}
