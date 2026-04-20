import "server-only";

import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { expandStorageUrl } from "@/lib/storage-utils";
import { getProjectAccessScope } from "./access";
import type { DashboardDocument, DashboardMetric } from "./dashboard";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface DocumentFilters {
  query?: string;
  status?: string;
  discipline?: string;
  revision?: string;
}

export interface DocumentControlData {
  metrics: DashboardMetric[];
  projects: {
    id: string;
    name: string;
    projectNumber: string | null;
  }[];
  documents: DashboardDocument[];
  availableDisciplines: string[];
  availableRevisions: string[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

export async function getDocumentControlData(
  sessionUser: DashboardSessionUser,
  filters: DocumentFilters,
): Promise<DocumentControlData> {
  try {
    const accessScope = await getProjectAccessScope(sessionUser);
    const scopedDocumentCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(documents.projectId, accessScope.projectIds)
        : null;
    const scopedProjectCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(projects.id, accessScope.projectIds)
        : null;

    const conditions = [
      scopedDocumentCondition ?? undefined,
      filters.query
        ? or(
            ilike(documents.documentNumber, `%${filters.query}%`),
            ilike(documents.title, `%${filters.query}%`),
            ilike(projects.name, `%${filters.query}%`),
          )
        : undefined,
      filters.status ? eq(documents.status, filters.status) : undefined,
      filters.discipline
        ? eq(documents.discipline, filters.discipline)
        : undefined,
      filters.revision ? eq(documents.revision, filters.revision) : undefined,
    ].filter(Boolean);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [
      totalRows,
      submittedRows,
      reviewRows,
      approvedRows,
      projectRows,
      documentRows,
      disciplineRows,
      revisionRows,
    ] = await Promise.all([
      scopedDocumentCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(documents)
            .where(scopedDocumentCondition),
      db
        .select({ value: count() })
        .from(documents)
        .where(
          and(
            inArray(documents.status, ["submitted", "under_review"]),
            scopedDocumentCondition ?? undefined,
          ),
        ),
      scopedDocumentCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(documents)
            .where(
              and(
                eq(documents.status, "under_review"),
                scopedDocumentCondition,
              ),
            ),
      scopedDocumentCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(documents)
            .where(
              and(eq(documents.status, "approved"), scopedDocumentCondition),
            ),
      scopedProjectCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: projects.id,
              name: projects.name,
              projectNumber: projects.projectNumber,
            })
            .from(projects)
            .where(scopedProjectCondition)
            .orderBy(projects.name),
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
              uploadedAt: documents.uploadedAt,
              createdBy: documents.createdBy,
              fileSize: documents.fileSize,
              images: documents.images,
              fileUrl: documents.fileUrl,
              fileType: documents.fileType,
            })
            .from(documents)
            .innerJoin(projects, eq(documents.projectId, projects.id))
            .where(whereClause)
            .orderBy(desc(documents.uploadedAt))
            .limit(24),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({ discipline: documents.discipline })
            .from(documents)
            .where(
              and(ilike(documents.discipline, `%`), scopedDocumentCondition),
            )
            .orderBy(documents.discipline),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({ revision: documents.revision })
            .from(documents)
            .where(scopedDocumentCondition)
            .orderBy(documents.revision),
    ]);

    const [total] = totalRows;
    const [submitted] = submittedRows;
    const [review] = reviewRows;
    const [approved] = approvedRows;

    return {
      metrics: [
        {
          label: "Total documents",
          value: formatCount(total?.value),
          description: "Controlled records currently in the EDMS.",
          tone: "blue",
          icon: "documents",
        },
        {
          label: "Submitted",
          value: formatCount(submitted?.value),
          description: "Packages awaiting or entering review.",
          tone: "amber",
          icon: "reviews",
        },
        {
          label: "Under review",
          value: formatCount(review?.value),
          description: "Documents actively moving through review steps.",
          tone: "rose",
          icon: "reviews",
        },
        {
          label: "Approved",
          value: formatCount(approved?.value),
          description: "Accepted revisions available for downstream use.",
          tone: "emerald",
          icon: "documents",
        },
      ],
      projects: projectRows.map((project) => ({
        id: String(project.id),
        name: project.name,
        projectNumber: project.projectNumber,
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
        uploadedLabel: formatDateLabel(document.uploadedAt),
        images: document.images, // Keep truncated, expand in component
        fileUrl: expandStorageUrl(document.fileUrl), // Expand file URL
        fileType: document.fileType,
      })),
      availableDisciplines: Array.from(
        new Set(
          disciplineRows
            .map((row) => row.discipline)
            .filter((discipline): discipline is string => Boolean(discipline)),
        ),
      ),
      availableRevisions: Array.from(
        new Set(
          revisionRows
            .map((row) => row.revision)
            .filter((revision): revision is string => Boolean(revision)),
        ),
      ),
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    console.error("Error fetching document control data:", error);
    return {
      metrics: [
        {
          label: "Total documents",
          value: "0",
          description: "Controlled records currently in the EDMS.",
          tone: "blue",
          icon: "documents",
        },
        {
          label: "Submitted",
          value: "0",
          description: "Packages awaiting or entering review.",
          tone: "amber",
          icon: "reviews",
        },
        {
          label: "Under review",
          value: "0",
          description: "Documents actively moving through review steps.",
          tone: "rose",
          icon: "reviews",
        },
        {
          label: "Approved",
          value: "0",
          description: "Accepted revisions available for downstream use.",
          tone: "emerald",
          icon: "documents",
        },
      ],
      projects: [],
      documents: [],
      availableDisciplines: [],
      availableRevisions: [],
      isUsingFallbackData: true,
      statusMessage:
        "Unable to load data. Please check your connection and try again.",
    };
  }
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return "Uploaded date pending";
  }

  return `Uploaded ${formatStoredAbsoluteDate(date) ?? "date pending"}`;
}

function formatCount(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}
