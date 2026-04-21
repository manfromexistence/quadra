import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  disciplines,
  documents,
  documentTypes,
  projectConfig,
  stakeholders,
  workflowStepTemplates,
} from "@/db/schema";
import type { DashboardSessionUser } from "./session";

export interface ProjectConfigData {
  config: {
    id: string;
    projectId: string;
    projectCode: string;
    shortCode: string;
    client: string | null;
    contractor: string | null;
    currency: string | null;
    numberingPattern: string;
    sequencePadding: number;
    separator: string;
    revisionScheme: string;
    sequenceReset: string;
    defaultReviewSla: string | null;
    reminderBeforeDue: number | null;
    overdueEscalation: string | null;
    autoCloseAfter: string | null;
  } | null;
  disciplines: Array<{
    id: string;
    code: string;
    name: string;
    color: string;
    docCount: number;
  }>;
  documentTypes: Array<{
    id: string;
    code: string;
    name: string;
    docCount: number;
  }>;
  stakeholders: Array<{
    id: string;
    stakeholderId: string;
    name: string;
    role: string;
    contact: string | null;
  }>;
  workflowSteps: Array<{
    id: string;
    stepName: string;
    actor: string;
    duration: string;
  }>;
}

export async function getProjectConfigData(
  sessionUser: DashboardSessionUser,
  projectId: string,
): Promise<ProjectConfigData> {
  try {
    // Get project configuration
    const config = await db.query.projectConfig.findFirst({
      where: eq(projectConfig.projectId, projectId),
    });

    // Get disciplines with document counts
    const disciplineRows = await db
      .select({
        id: disciplines.id,
        code: disciplines.code,
        name: disciplines.name,
        color: disciplines.color,
        sortOrder: disciplines.sortOrder,
      })
      .from(disciplines)
      .where(
        and(
          eq(disciplines.projectId, projectId),
          eq(disciplines.isActive, true),
        ),
      )
      .orderBy(disciplines.sortOrder);

    const disciplinesWithCounts = await Promise.all(
      disciplineRows.map(async (discipline) => {
        const [countResult] = await db
          .select({ count: count() })
          .from(documents)
          .where(
            and(
              eq(documents.projectId, projectId),
              eq(documents.discipline, discipline.code),
            ),
          );

        return {
          id: discipline.id,
          code: discipline.code,
          name: discipline.name,
          color: discipline.color,
          docCount: countResult?.count ?? 0,
        };
      }),
    );

    // Get document types with document counts
    const docTypeRows = await db
      .select({
        id: documentTypes.id,
        code: documentTypes.code,
        name: documentTypes.name,
        sortOrder: documentTypes.sortOrder,
      })
      .from(documentTypes)
      .where(
        and(
          eq(documentTypes.projectId, projectId),
          eq(documentTypes.isActive, true),
        ),
      )
      .orderBy(documentTypes.sortOrder);

    const docTypesWithCounts = await Promise.all(
      docTypeRows.map(async (docType) => {
        const [countResult] = await db
          .select({ count: count() })
          .from(documents)
          .where(
            and(
              eq(documents.projectId, projectId),
              eq(documents.category, docType.code),
            ),
          );

        return {
          id: docType.id,
          code: docType.code,
          name: docType.name,
          docCount: countResult?.count ?? 0,
        };
      }),
    );

    // Get stakeholders
    const stakeholderRows = await db
      .select({
        id: stakeholders.id,
        stakeholderId: stakeholders.stakeholderId,
        name: stakeholders.name,
        role: stakeholders.role,
        contact: stakeholders.contact,
      })
      .from(stakeholders)
      .where(
        and(
          eq(stakeholders.projectId, projectId),
          eq(stakeholders.isActive, true),
        ),
      )
      .orderBy(stakeholders.sortOrder);

    // Get workflow step templates
    const workflowRows = await db
      .select({
        id: workflowStepTemplates.id,
        stepName: workflowStepTemplates.stepName,
        actor: workflowStepTemplates.actor,
        duration: workflowStepTemplates.duration,
      })
      .from(workflowStepTemplates)
      .where(
        and(
          eq(workflowStepTemplates.projectId, projectId),
          eq(workflowStepTemplates.isActive, true),
        ),
      )
      .orderBy(workflowStepTemplates.sortOrder);

    return {
      config: config
        ? {
            id: config.id,
            projectId: config.projectId,
            projectCode: config.projectCode,
            shortCode: config.shortCode,
            client: config.client,
            contractor: config.contractor,
            currency: config.currency,
            numberingPattern: config.numberingPattern,
            sequencePadding: config.sequencePadding,
            separator: config.separator,
            revisionScheme: config.revisionScheme,
            sequenceReset: config.sequenceReset,
            defaultReviewSla: config.defaultReviewSla,
            reminderBeforeDue: config.reminderBeforeDue,
            overdueEscalation: config.overdueEscalation,
            autoCloseAfter: config.autoCloseAfter,
          }
        : null,
      disciplines: disciplinesWithCounts,
      documentTypes: docTypesWithCounts,
      stakeholders: stakeholderRows,
      workflowSteps: workflowRows,
    };
  } catch (error) {
    console.error("Error fetching project config data:", error);
    throw error;
  }
}
