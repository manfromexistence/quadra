import "server-only";

import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documentComments, documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import { transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { getProjectAccessScope } from "./access";
import { getEdmsDashboardData } from "./dashboard";
import type { DashboardSessionUser } from "./session";

export type GlobalSearchCategory =
  | "project"
  | "document"
  | "workflow"
  | "transmittal"
  | "notification";

export interface GlobalSearchFilters {
  query: string;
  categories: GlobalSearchCategory[];
  status: string;
  projectId: string;
  uploaderId: string;
  fromDate: string;
  toDate: string;
}

export interface GlobalSearchQueryInput {
  q?: string | string[];
  category?: string | string[];
  status?: string | string[];
  projectId?: string | string[];
  uploaderId?: string | string[];
  from?: string | string[];
  to?: string | string[];
}

export interface SearchOption {
  id: string;
  label: string;
  description: string | null;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: GlobalSearchCategory;
  href: string;
  meta: string;
  source: string;
  status?: string;
}

export interface GlobalSearchData {
  query: string;
  filters: GlobalSearchFilters;
  results: GlobalSearchResult[];
  availableProjects: SearchOption[];
  availableUploaders: SearchOption[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

const SEARCH_CATEGORIES: GlobalSearchCategory[] = [
  "project",
  "document",
  "workflow",
  "transmittal",
  "notification",
];

export function normalizeGlobalSearchFilters(
  input: GlobalSearchQueryInput,
): GlobalSearchFilters {
  const normalizedCategories = ensureCategories(asSingleValue(input.category));

  return {
    query: asSingleValue(input.q).trim(),
    categories: normalizedCategories,
    status: asSingleValue(input.status).trim(),
    projectId: asSingleValue(input.projectId).trim(),
    uploaderId: asSingleValue(input.uploaderId).trim(),
    fromDate: asSingleValue(input.from).trim(),
    toDate: asSingleValue(input.to).trim(),
  };
}

export async function getGlobalSearchData(
  sessionUser: DashboardSessionUser,
  input: string | GlobalSearchFilters,
): Promise<GlobalSearchData> {
  const filters =
    typeof input === "string"
      ? normalizeGlobalSearchFilters({ q: input })
      : normalizeGlobalSearchFilters(input);

  const [availableProjects, availableUploaders] = await Promise.all([
    getProjectOptions(sessionUser),
    getUploaderOptions(sessionUser),
  ]);

  if (!hasSearchIntent(filters)) {
    return {
      query: filters.query,
      filters,
      results: [],
      availableProjects,
      availableUploaders,
      isUsingFallbackData: false,
      statusMessage: null,
    };
  }

  try {
    const accessScope = await getProjectAccessScope(sessionUser);
    const normalizedQuery = filters.query;
    const pattern = normalizedQuery.length > 0 ? `%${normalizedQuery}%` : null;
    const results: GlobalSearchResult[] = [];
    const scopedProjectCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(projects.id, accessScope.projectIds)
        : null;
    const scopedDocumentCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(documents.projectId, accessScope.projectIds)
        : null;
    const scopedTransmittalCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(transmittals.projectId, accessScope.projectIds)
        : null;

    if (includesCategory(filters, "project")) {
      if (scopedProjectCondition === null) {
        // no accessible projects
      } else {
        const projectConditions = compactConditions([
          scopedProjectCondition ?? undefined,
          pattern
            ? or(
                ilike(projects.name, pattern),
                ilike(projects.projectNumber, pattern),
                ilike(projects.location, pattern),
              )
            : undefined,
          filters.projectId ? eq(projects.id, filters.projectId) : undefined,
          filters.status ? eq(projects.status, filters.status) : undefined,
          createDateBounds(projects.createdAt, filters),
        ]);

        const projectRows = await db
          .select({
            id: projects.id,
            name: projects.name,
            projectNumber: projects.projectNumber,
            location: projects.location,
            status: projects.status,
          })
          .from(projects)
          .where(combineConditions(projectConditions))
          .orderBy(desc(projects.updatedAt))
          .limit(8);

        results.push(
          ...projectRows.map((project) => ({
            id: project.id,
            title: project.name,
            subtitle: project.projectNumber ?? "Project",
            category: "project" as const,
            href: `/dashboard/projects/${project.id}`,
            meta: project.location ?? "Location pending",
            source: "project record",
            status: project.status ?? undefined,
          })),
        );
      }
    }

    if (includesCategory(filters, "document")) {
      if (scopedDocumentCondition === null) {
        // no accessible documents
      } else {
        const documentConditions = compactConditions([
          scopedDocumentCondition ?? undefined,
          pattern
            ? or(
                ilike(documents.title, pattern),
                ilike(documents.documentNumber, pattern),
                ilike(documents.description, pattern),
                ilike(documents.category, pattern),
                ilike(documents.discipline, pattern),
              )
            : undefined,
          filters.projectId
            ? eq(documents.projectId, filters.projectId)
            : undefined,
          filters.status ? eq(documents.status, filters.status) : undefined,
          filters.uploaderId
            ? eq(documents.uploadedBy, filters.uploaderId)
            : undefined,
          createDateBounds(documents.uploadedAt, filters),
        ]);

        const documentRows = await db
          .select({
            id: documents.id,
            title: documents.title,
            documentNumber: documents.documentNumber,
            revision: documents.revision,
            status: documents.status,
            projectName: projects.name,
          })
          .from(documents)
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .where(combineConditions(documentConditions))
          .orderBy(desc(documents.updatedAt))
          .limit(8);

        const commentConditions = compactConditions([
          scopedDocumentCondition ?? undefined,
          pattern
            ? or(
                ilike(documentComments.comment, pattern),
                ilike(documents.title, pattern),
                ilike(documents.documentNumber, pattern),
              )
            : undefined,
          filters.projectId
            ? eq(documents.projectId, filters.projectId)
            : undefined,
          filters.uploaderId
            ? eq(documentComments.userId, filters.uploaderId)
            : undefined,
          createDateBounds(documentComments.createdAt, filters),
        ]);

        const commentRows = await db
          .select({
            id: documentComments.id,
            documentId: documents.id,
            title: documents.title,
            documentNumber: documents.documentNumber,
            status: documents.status,
            projectName: projects.name,
            comment: documentComments.comment,
          })
          .from(documentComments)
          .innerJoin(documents, eq(documentComments.documentId, documents.id))
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .where(combineConditions(commentConditions))
          .orderBy(desc(documentComments.createdAt))
          .limit(6);

        results.push(
          ...documentRows.map((document) => ({
            id: document.id,
            title: document.title,
            subtitle: document.documentNumber,
            category: "document" as const,
            href: `/dashboard/documents/${document.id}`,
            meta: `${document.projectName}${document.revision ? ` • Rev ${document.revision}` : ""}`,
            source: "document register",
            status: document.status ?? undefined,
          })),
          ...commentRows.map((comment) => ({
            id: comment.id,
            title: comment.title,
            subtitle: comment.documentNumber,
            category: "document" as const,
            href: `/dashboard/documents/${comment.documentId}`,
            meta: truncateText(comment.comment, 140),
            source: "comment match",
            status: comment.status ?? undefined,
          })),
        );
      }
    }

    if (includesCategory(filters, "workflow")) {
      if (scopedDocumentCondition === null) {
        // no accessible workflows
      } else {
        const workflowConditions = compactConditions([
          scopedDocumentCondition ?? undefined,
          pattern
            ? or(
                ilike(documentWorkflows.workflowName, pattern),
                ilike(documents.title, pattern),
                ilike(documents.documentNumber, pattern),
              )
            : undefined,
          filters.projectId
            ? eq(documents.projectId, filters.projectId)
            : undefined,
          filters.status
            ? eq(documentWorkflows.status, filters.status)
            : undefined,
          createDateBounds(documentWorkflows.startedAt, filters),
        ]);

        const workflowRows = await db
          .select({
            id: documentWorkflows.id,
            workflowName: documentWorkflows.workflowName,
            status: documentWorkflows.status,
            documentTitle: documents.title,
            documentNumber: documents.documentNumber,
            projectName: projects.name,
          })
          .from(documentWorkflows)
          .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .where(combineConditions(workflowConditions))
          .orderBy(desc(documentWorkflows.startedAt))
          .limit(8);

        const workflowNoteConditions = compactConditions([
          scopedDocumentCondition ?? undefined,
          pattern
            ? or(
                ilike(workflowSteps.comments, pattern),
                ilike(workflowSteps.stepName, pattern),
                ilike(documentWorkflows.workflowName, pattern),
              )
            : undefined,
          filters.projectId
            ? eq(documents.projectId, filters.projectId)
            : undefined,
          filters.uploaderId
            ? eq(workflowSteps.assignedTo, filters.uploaderId)
            : undefined,
          filters.status ? eq(workflowSteps.status, filters.status) : undefined,
          createDateBounds(workflowSteps.completedAt, filters) ??
            createDateBounds(workflowSteps.startedAt, filters),
        ]);

        const workflowNoteRows = await db
          .select({
            id: workflowSteps.id,
            workflowId: documentWorkflows.id,
            workflowName: documentWorkflows.workflowName,
            status: workflowSteps.status,
            documentTitle: documents.title,
            documentNumber: documents.documentNumber,
            comments: workflowSteps.comments,
            projectName: projects.name,
          })
          .from(workflowSteps)
          .innerJoin(
            documentWorkflows,
            eq(workflowSteps.workflowId, documentWorkflows.id),
          )
          .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .where(combineConditions(workflowNoteConditions))
          .orderBy(
            desc(workflowSteps.completedAt),
            desc(workflowSteps.startedAt),
          )
          .limit(6);

        results.push(
          ...workflowRows.map((workflow) => ({
            id: workflow.id,
            title: workflow.workflowName,
            subtitle: workflow.documentNumber,
            category: "workflow" as const,
            href: "/dashboard/workflows",
            meta: `${workflow.projectName} • ${workflow.documentTitle}`,
            source: "workflow record",
            status: workflow.status ?? undefined,
          })),
          ...workflowNoteRows.map((note) => ({
            id: note.id,
            title: note.workflowName,
            subtitle: note.documentNumber,
            category: "workflow" as const,
            href: "/dashboard/workflows",
            meta: truncateText(
              note.comments || `${note.projectName} • ${note.documentTitle}`,
              140,
            ),
            source: "workflow note",
            status: note.status ?? undefined,
          })),
        );
      }
    }

    if (includesCategory(filters, "transmittal")) {
      if (scopedTransmittalCondition === null) {
        // no accessible transmittals
      } else {
        const transmittalConditions = compactConditions([
          scopedTransmittalCondition ?? undefined,
          pattern
            ? or(
                ilike(transmittals.transmittalNumber, pattern),
                ilike(transmittals.subject, pattern),
                ilike(transmittals.description, pattern),
                ilike(transmittals.notes, pattern),
              )
            : undefined,
          filters.projectId
            ? eq(transmittals.projectId, filters.projectId)
            : undefined,
          filters.status ? eq(transmittals.status, filters.status) : undefined,
          filters.uploaderId
            ? eq(transmittals.sentFrom, filters.uploaderId)
            : undefined,
          createDateBounds(transmittals.createdAt, filters),
        ]);

        const transmittalRows = await db
          .select({
            id: transmittals.id,
            transmittalNumber: transmittals.transmittalNumber,
            subject: transmittals.subject,
            status: transmittals.status,
            projectName: projects.name,
          })
          .from(transmittals)
          .innerJoin(projects, eq(transmittals.projectId, projects.id))
          .where(combineConditions(transmittalConditions))
          .orderBy(desc(transmittals.createdAt))
          .limit(8);

        results.push(
          ...transmittalRows.map((transmittal) => ({
            id: transmittal.id,
            title: transmittal.subject,
            subtitle: transmittal.transmittalNumber,
            category: "transmittal" as const,
            href: "/dashboard/transmittals",
            meta: transmittal.projectName,
            source: "transmittal record",
            status: transmittal.status ?? undefined,
          })),
        );
      }
    }

    if (includesCategory(filters, "notification")) {
      const notificationConditions = compactConditions([
        eq(notifications.userId, sessionUser.id),
        pattern
          ? or(
              ilike(notifications.title, pattern),
              ilike(notifications.message, pattern),
            )
          : undefined,
        filters.projectId
          ? eq(notifications.projectId, filters.projectId)
          : undefined,
        filters.status === "read"
          ? eq(notifications.isRead, true)
          : filters.status === "unread"
            ? eq(notifications.isRead, false)
            : undefined,
        createDateBounds(notifications.createdAt, filters),
      ]);

      const notificationRows = await db
        .select({
          id: notifications.id,
          title: notifications.title,
          message: notifications.message,
          actionUrl: notifications.actionUrl,
          isRead: notifications.isRead,
          projectName: projects.name,
        })
        .from(notifications)
        .leftJoin(projects, eq(notifications.projectId, projects.id))
        .where(combineConditions(notificationConditions))
        .orderBy(desc(notifications.createdAt))
        .limit(8);

      results.push(
        ...notificationRows.map((notification) => ({
          id: notification.id,
          title: notification.title,
          subtitle: "Notification",
          category: "notification" as const,
          href: notification.actionUrl ?? "/dashboard/notifications",
          meta:
            notification.projectName ?? truncateText(notification.message, 140),
          source: "notification inbox",
          status: notification.isRead ? "read" : "unread",
        })),
      );
    }

    return {
      query: filters.query,
      filters,
      results: results.slice(0, 40),
      availableProjects,
      availableUploaders,
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    return createFallbackSearchData(
      sessionUser,
      filters,
      availableProjects,
      availableUploaders,
      error,
    );
  }
}

async function getProjectOptions(
  sessionUser: DashboardSessionUser,
): Promise<SearchOption[]> {
  const accessScope = await getProjectAccessScope(sessionUser);
  const scopedCondition = accessScope.isAdmin
    ? undefined
    : accessScope.projectIds.length > 0
      ? inArray(projects.id, accessScope.projectIds)
      : null;

  if (scopedCondition === null) {
    return [];
  }

  const rows = await db
    .select({
      id: projects.id,
      label: projects.name,
      description: projects.projectNumber,
    })
    .from(projects)
    .where(scopedCondition)
    .orderBy(desc(projects.updatedAt))
    .limit(50);

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    description: row.description,
  }));
}

async function getUploaderOptions(
  sessionUser: DashboardSessionUser,
): Promise<SearchOption[]> {
  const accessScope = await getProjectAccessScope(sessionUser);

  if (!accessScope.isAdmin && accessScope.projectIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      id: userTable.id,
      label: userTable.name,
      description: userTable.email,
    })
    .from(userTable)
    .innerJoin(documents, eq(userTable.id, documents.uploadedBy))
    .where(
      accessScope.isAdmin
        ? undefined
        : inArray(documents.projectId, accessScope.projectIds),
    )
    .orderBy(desc(userTable.updatedAt))
    .limit(50);

  return Array.from(
    new Map(
      rows.map((row) => [
        row.id,
        {
          id: row.id,
          label: row.label,
          description: row.description,
        },
      ]),
    ).values(),
  );
}

function compactConditions(conditions: Array<SQL | undefined>) {
  return conditions.filter((condition): condition is SQL => Boolean(condition));
}

function combineConditions(conditions: SQL[]) {
  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}

function createDateBounds(
  column: SQL | { _: { data: Date | null } },
  filters: GlobalSearchFilters,
) {
  const fromDate = parseDateBoundary(filters.fromDate, "start");
  const toDate = parseDateBoundary(filters.toDate, "end");

  if (fromDate && toDate) {
    return and(gte(column as never, fromDate), lte(column as never, toDate));
  }

  if (fromDate) {
    return gte(column as never, fromDate);
  }

  if (toDate) {
    return lte(column as never, toDate);
  }

  return undefined;
}

function parseDateBoundary(value: string, boundary: "start" | "end") {
  if (!value) {
    return null;
  }

  const date = new Date(
    `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasSearchIntent(filters: GlobalSearchFilters) {
  return (
    filters.query.length > 0 ||
    filters.status.length > 0 ||
    filters.projectId.length > 0 ||
    filters.uploaderId.length > 0 ||
    filters.fromDate.length > 0 ||
    filters.toDate.length > 0 ||
    filters.categories.length < SEARCH_CATEGORIES.length
  );
}

function includesCategory(
  filters: GlobalSearchFilters,
  category: GlobalSearchCategory,
) {
  return filters.categories.includes(category);
}

function ensureCategories(rawValue: string) {
  if (!rawValue) {
    return [...SEARCH_CATEGORIES];
  }

  const parsed = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is GlobalSearchCategory =>
      SEARCH_CATEGORIES.includes(value as GlobalSearchCategory),
    );

  return parsed.length > 0 ? parsed : [...SEARCH_CATEGORIES];
}

function asSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

async function createFallbackSearchData(
  sessionUser: DashboardSessionUser,
  filters: GlobalSearchFilters,
  availableProjects: SearchOption[],
  availableUploaders: SearchOption[],
  error: unknown,
): Promise<GlobalSearchData> {
  const dashboard = await getEdmsDashboardData(sessionUser);
  const pattern = filters.query.toLowerCase();

  const results: GlobalSearchResult[] = [
    ...dashboard.projects
      .filter(
        (project) =>
          includesCategory(filters, "project") &&
          (!pattern ||
            project.name.toLowerCase().includes(pattern) ||
            project.projectNumber?.toLowerCase().includes(pattern)),
      )
      .map((project) => ({
        id: project.id,
        title: project.name,
        subtitle: project.projectNumber ?? "Project",
        category: "project" as const,
        href: `/dashboard/projects/${project.id}`,
        meta: project.location ?? "Location pending",
        source: "project record",
        status: project.status,
      })),
    ...dashboard.documents
      .filter(
        (document) =>
          includesCategory(filters, "document") &&
          (!pattern ||
            document.title.toLowerCase().includes(pattern) ||
            document.documentNumber.toLowerCase().includes(pattern) ||
            document.projectName.toLowerCase().includes(pattern)),
      )
      .map((document) => ({
        id: document.id,
        title: document.title,
        subtitle: document.documentNumber,
        category: "document" as const,
        href: `/dashboard/documents/${document.id}`,
        meta: `${document.projectName}${document.revision ? ` • Rev ${document.revision}` : ""}`,
        source: "document register",
        status: document.status,
      })),
    ...dashboard.transmittals
      .filter(
        (transmittal) =>
          includesCategory(filters, "transmittal") &&
          (!pattern ||
            transmittal.subject.toLowerCase().includes(pattern) ||
            transmittal.transmittalNumber.toLowerCase().includes(pattern)),
      )
      .map((transmittal) => ({
        id: transmittal.id,
        title: transmittal.subject,
        subtitle: transmittal.transmittalNumber,
        category: "transmittal" as const,
        href: "/dashboard/transmittals",
        meta: transmittal.projectName,
        source: "transmittal record",
        status: transmittal.status,
      })),
  ];

  return {
    query: filters.query,
    filters,
    results,
    availableProjects,
    availableUploaders,
    isUsingFallbackData: true,
    statusMessage: getFallbackMessage(error),
  };
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing sample search results while the live EDMS workspace is still being connected.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing sample search results because DATABASE_URL is not configured in this environment.";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    return "Showing sample search results until the EDMS database migrations are applied.";
  }

  return "Showing sample search results while the live EDMS workspace is still being connected.";
}
