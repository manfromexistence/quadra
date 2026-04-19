import "server-only";

import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { activityLog } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import { documentWorkflows } from "@/db/schema/workflows";
import type { DashboardSessionUser } from "./session";

export interface AnalyticsSummaryMetric {
  label: string;
  value: string;
  description: string;
}

export interface AnalyticsTimeSeriesPoint {
  label: string;
  value: number;
}

export interface AnalyticsStatusPoint {
  status: string;
  count: number;
}

export interface AnalyticsRankedPoint {
  id: string;
  label: string;
  value: number;
  subtitle: string | null;
}

export interface AdminAnalyticsData {
  summary: {
    totalProjects: number;
    totalDocuments: number;
    totalWorkflows: number;
    activeUsers: number;
    totalUsers: number;
    totalStorageBytes: number;
    approvedWorkflows: number;
    pendingWorkflows: number;
    rejectionRate: number;
  };
  documentsByMonth: AnalyticsTimeSeriesPoint[];
  userGrowthByMonth: AnalyticsTimeSeriesPoint[];
  workflowsByStatus: AnalyticsStatusPoint[];
  mostActiveUsers: AnalyticsRankedPoint[];
  mostActiveProjects: AnalyticsRankedPoint[];
  summaryMetrics: AnalyticsSummaryMetric[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

interface CountRow {
  value: number | string | null;
}

interface CountByUserRow {
  userId: string | null;
  name: string | null;
  email: string | null;
  count: number | string | null;
}

interface CountByProjectRow {
  projectId: string | null;
  name: string | null;
  projectNumber: string | null;
  count: number | string | null;
}

interface WorkflowStatusRow {
  status: string | null;
  count: number | string | null;
}

interface MonthCountRow {
  period: string | null;
  count: number | string | null;
}

export async function getAdminAnalyticsData(
  sessionUser: DashboardSessionUser,
): Promise<AdminAnalyticsData> {
  try {
    const rangeStart = getMonthRangeStart(11);
    const documentMonthBucket = sql<string>`to_char(date_trunc('month', ${documents.uploadedAt}), 'YYYY-MM')`;
    const userMonthBucket = sql<string>`to_char(date_trunc('month', ${userTable.createdAt}), 'YYYY-MM')`;

    const [
      summaryRows,
      documentMonthRows,
      userMonthRows,
      workflowStatusRows,
      userRows,
      projectRows,
    ] = await Promise.all([
      Promise.all([
        db.select({ value: count() }).from(projects),
        db.select({ value: count() }).from(documents),
        db.select({ value: count() }).from(documentWorkflows),
        db
          .select({ value: count() })
          .from(userTable)
          .where(eq(userTable.isActive, true)),
        db.select({ value: count() }).from(userTable),
        db
          .select({ value: count() })
          .from(documentWorkflows)
          .where(eq(documentWorkflows.status, "approved")),
        db
          .select({ value: count() })
          .from(documentWorkflows)
          .where(
            and(
              eq(documentWorkflows.status, "pending"),
              isNotNull(documentWorkflows.id),
            ),
          ),
        db
          .select({ value: count() })
          .from(documentWorkflows)
          .where(eq(documentWorkflows.status, "rejected")),
        db
          .select({
            value: sql<number>`coalesce(sum(${documents.fileSize}), 0)`,
          })
          .from(documents),
      ]),
      db
        .select({
          period: documentMonthBucket,
          count: count(),
        })
        .from(documents)
        .where(gte(documents.uploadedAt, rangeStart))
        .groupBy(documentMonthBucket)
        .orderBy(documentMonthBucket),
      db
        .select({
          period: userMonthBucket,
          count: count(),
        })
        .from(userTable)
        .where(gte(userTable.createdAt, rangeStart))
        .groupBy(userMonthBucket)
        .orderBy(userMonthBucket),
      db
        .select({
          status: documentWorkflows.status,
          count: count(),
        })
        .from(documentWorkflows)
        .groupBy(documentWorkflows.status),
      Promise.all([
        db
          .select({
            userId: activityLog.userId,
            name: userTable.name,
            email: userTable.email,
            count: count(),
          })
          .from(activityLog)
          .leftJoin(userTable, eq(activityLog.userId, userTable.id))
          .groupBy(activityLog.userId, userTable.name, userTable.email)
          .orderBy(desc(count()))
          .limit(10),
        db
          .select({
            userId: documents.uploadedBy,
            name: userTable.name,
            email: userTable.email,
            count: count(),
          })
          .from(documents)
          .leftJoin(userTable, eq(documents.uploadedBy, userTable.id))
          .groupBy(documents.uploadedBy, userTable.name, userTable.email)
          .orderBy(desc(count()))
          .limit(10),
        db
          .select({
            userId: documentWorkflows.createdBy,
            name: userTable.name,
            email: userTable.email,
            count: count(),
          })
          .from(documentWorkflows)
          .leftJoin(userTable, eq(documentWorkflows.createdBy, userTable.id))
          .groupBy(documentWorkflows.createdBy, userTable.name, userTable.email)
          .orderBy(desc(count()))
          .limit(10),
      ]),
      Promise.all([
        db
          .select({
            projectId: activityLog.projectId,
            name: projects.name,
            projectNumber: projects.projectNumber,
            count: count(),
          })
          .from(activityLog)
          .leftJoin(projects, eq(activityLog.projectId, projects.id))
          .where(isNotNull(activityLog.projectId))
          .groupBy(activityLog.projectId, projects.name, projects.projectNumber)
          .orderBy(desc(count()))
          .limit(10),
        db
          .select({
            projectId: documents.projectId,
            name: projects.name,
            projectNumber: projects.projectNumber,
            count: count(),
          })
          .from(documents)
          .leftJoin(projects, eq(documents.projectId, projects.id))
          .groupBy(documents.projectId, projects.name, projects.projectNumber)
          .orderBy(desc(count()))
          .limit(10),
        db
          .select({
            projectId: projects.id,
            name: projects.name,
            projectNumber: projects.projectNumber,
            count: count(),
          })
          .from(documentWorkflows)
          .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .groupBy(projects.id, projects.name, projects.projectNumber)
          .orderBy(desc(count()))
          .limit(10),
      ]),
    ]);

    const [userActivityRows, userDocumentRows, userWorkflowRows] = userRows;
    const [projectActivityRows, projectDocumentRows, projectWorkflowRows] =
      projectRows;

    const summary = mapSummaryCounts(summaryRows as CountRow[][]);
    const documentsByMonth = mapMonthSeries(
      documentMonthRows as MonthCountRow[],
      rangeStart,
      "Documents",
    );
    const userGrowthByMonth = mapMonthSeries(
      userMonthRows as MonthCountRow[],
      rangeStart,
      "Users",
    );
    const workflowsByStatus = normalizeStatusRows(
      workflowStatusRows as WorkflowStatusRow[],
    );
    const mostActiveUsers = mergeRankedRows(
      userActivityRows as CountByUserRow[],
      userDocumentRows as CountByUserRow[],
      userWorkflowRows as CountByUserRow[],
    );
    const mostActiveProjects = mergeProjectRows(
      projectActivityRows as CountByProjectRow[],
      projectDocumentRows as CountByProjectRow[],
      projectWorkflowRows as CountByProjectRow[],
    );

    return {
      summary,
      documentsByMonth,
      userGrowthByMonth,
      workflowsByStatus,
      mostActiveUsers,
      mostActiveProjects,
      summaryMetrics: buildSummaryMetrics(summary),
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    return createFallbackAnalyticsData(sessionUser, getFallbackMessage(error));
  }
}

function mapSummaryCounts(summaryRows: CountRow[][]) {
  const [
    projectsRow,
    documentsRow,
    workflowsRow,
    activeUsersRow,
    usersRow,
    approvedRow,
    pendingRow,
    rejectedRow,
    storageRow,
  ] = summaryRows;

  const totalWorkflows = toCount(workflowsRow?.[0]?.value);
  const approvedWorkflows = toCount(approvedRow?.[0]?.value);
  const rejectionRate =
    totalWorkflows > 0
      ? Math.round((toCount(rejectedRow?.[0]?.value) / totalWorkflows) * 100)
      : 0;

  return {
    totalProjects: toCount(projectsRow?.[0]?.value),
    totalDocuments: toCount(documentsRow?.[0]?.value),
    totalWorkflows,
    activeUsers: toCount(activeUsersRow?.[0]?.value),
    totalUsers: toCount(usersRow?.[0]?.value),
    totalStorageBytes: toCount(storageRow?.[0]?.value),
    approvedWorkflows,
    pendingWorkflows: toCount(pendingRow?.[0]?.value),
    rejectionRate,
  };
}

function buildSummaryMetrics(
  summary: AdminAnalyticsData["summary"],
): AnalyticsSummaryMetric[] {
  return [
    {
      label: "Documents uploaded",
      value: formatCount(summary.totalDocuments),
      description: "Controlled document records across all live projects.",
    },
    {
      label: "Active users",
      value: formatCount(summary.activeUsers),
      description: "Enabled user accounts with dashboard access.",
    },
    {
      label: "Open workflows",
      value: formatCount(summary.pendingWorkflows),
      description: "Review steps still in pending or in-progress states.",
    },
    {
      label: "Approval rate",
      value: `${summary.totalWorkflows > 0 ? Math.round((summary.approvedWorkflows / summary.totalWorkflows) * 100) : 0}%`,
      description: "Approved workflows as a share of all workflow records.",
    },
    {
      label: "Storage used",
      value: formatBytes(summary.totalStorageBytes),
      description: "Total file storage referenced by the document register.",
    },
  ];
}

function mapMonthSeries(
  rows: MonthCountRow[],
  rangeStart: Date,
  label: string,
) {
  const lookup = new Map(
    rows.map((row) => [row.period ?? "", toCount(row.count)]),
  );
  const series: AnalyticsTimeSeriesPoint[] = [];

  for (let index = 0; index < 12; index += 1) {
    const date = addMonths(rangeStart, index);
    const key = formatMonthKey(date);

    series.push({
      label: formatMonthLabel(date),
      value: lookup.get(key) ?? 0,
    });
  }

  return series.length > 0 ? series : [{ label, value: 0 }];
}

function normalizeStatusRows(rows: WorkflowStatusRow[]) {
  const normalized = rows
    .map((row) => ({
      status: row.status ?? "unknown",
      count: toCount(row.count),
    }))
    .sort((left, right) => right.count - left.count);

  const preferredOrder = [
    "pending",
    "in_progress",
    "approved",
    "rejected",
    "cancelled",
  ];
  normalized.sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left.status);
    const rightIndex = preferredOrder.indexOf(right.status);

    if (leftIndex === -1 && rightIndex === -1) {
      return right.count - left.count;
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });

  return normalized;
}

function mergeRankedRows(
  activityRows: CountByUserRow[],
  documentRows: CountByUserRow[],
  workflowRows: CountByUserRow[],
) {
  const merged = new Map<string, AnalyticsRankedPoint>();

  for (const row of [...activityRows, ...documentRows, ...workflowRows]) {
    if (!row.userId) {
      continue;
    }

    const existing = merged.get(row.userId) ?? {
      id: row.userId,
      label: row.name ?? row.email ?? "Unknown user",
      value: 0,
      subtitle: row.email ?? null,
    };

    existing.value +=
      toCount(row.count) * getUserWeight(row, activityRows, documentRows);
    merged.set(row.userId, existing);
  }

  return [...merged.values()]
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
}

function mergeProjectRows(
  activityRows: CountByProjectRow[],
  documentRows: CountByProjectRow[],
  workflowRows: CountByProjectRow[],
) {
  const merged = new Map<string, AnalyticsRankedPoint>();

  for (const row of [...activityRows, ...documentRows, ...workflowRows]) {
    if (!row.projectId) {
      continue;
    }

    const existing = merged.get(row.projectId) ?? {
      id: row.projectId,
      label: row.name ?? row.projectNumber ?? "Unknown project",
      value: 0,
      subtitle: row.projectNumber ?? null,
    };

    existing.value +=
      toCount(row.count) * getProjectWeight(row, activityRows, documentRows);
    merged.set(row.projectId, existing);
  }

  return [...merged.values()]
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
}

function getUserWeight(
  row: CountByUserRow,
  activityRows: CountByUserRow[],
  documentRows: CountByUserRow[],
) {
  const isActivity = activityRows.includes(row);
  const isDocument = documentRows.includes(row);

  if (isActivity) {
    return 3;
  }

  if (isDocument) {
    return 2;
  }

  return 2;
}

function getProjectWeight(
  row: CountByProjectRow,
  activityRows: CountByProjectRow[],
  documentRows: CountByProjectRow[],
) {
  const isActivity = activityRows.includes(row);
  const isDocument = documentRows.includes(row);
  const isWorkflow = !isActivity && !isDocument;

  if (isActivity) {
    return 2;
  }

  if (isDocument) {
    return 3;
  }

  if (isWorkflow) {
    return 4;
  }

  return 1;
}

function createFallbackAnalyticsData(
  sessionUser: DashboardSessionUser,
  statusMessage: string,
): AdminAnalyticsData {
  const summary = {
    totalProjects: 7,
    totalDocuments: 184,
    totalWorkflows: 42,
    activeUsers: 18,
    totalUsers: 24,
    totalStorageBytes: 1_245_880_320,
    approvedWorkflows: 31,
    pendingWorkflows: 9,
    rejectionRate: 14,
  };

  return {
    summary,
    documentsByMonth: buildFallbackSeries("Documents"),
    userGrowthByMonth: buildFallbackSeries("Users"),
    workflowsByStatus: [
      { status: "pending", count: 9 },
      { status: "in_progress", count: 8 },
      { status: "approved", count: 18 },
      { status: "rejected", count: 7 },
    ],
    mostActiveUsers: [
      {
        id: `${sessionUser.id}-1`,
        label: sessionUser.name,
        value: 34,
        subtitle: sessionUser.email,
      },
      {
        id: "fallback-user-2",
        label: "Ayesha Karim",
        value: 28,
        subtitle: "ayesha@quadra.edms",
      },
      {
        id: "fallback-user-3",
        label: "Imran Hossain",
        value: 22,
        subtitle: "imran@quadra.edms",
      },
    ],
    mostActiveProjects: [
      {
        id: "fallback-project-1",
        label: "Structura Tower Podium",
        value: 54,
        subtitle: "STP-24-001",
      },
      {
        id: "fallback-project-2",
        label: "Al Noor Logistics Hub",
        value: 38,
        subtitle: "ANL-25-014",
      },
      {
        id: "fallback-project-3",
        label: "Creekside Villas Infrastructure",
        value: 27,
        subtitle: "CVI-25-008",
      },
    ],
    summaryMetrics: buildSummaryMetrics(summary),
    isUsingFallbackData: true,
    statusMessage,
  };
}

function buildFallbackSeries(label: string): AnalyticsTimeSeriesPoint[] {
  const base = [12, 18, 22, 24, 30, 28, 35, 31, 36, 40, 42, 45];

  return base.map((value, index) => ({
    label: `${label} M${index + 1}`,
    value,
  }));
}

function getMonthRangeStart(monthsBack: number) {
  const current = new Date();
  const start = new Date(
    Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1),
  );
  start.setUTCMonth(start.getUTCMonth() - monthsBack);
  return start;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

function formatMonthKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatBytes(bytes: number) {
  if (bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const size = bytes / 1024 ** index;
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function toCount(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing sample analytics while the live EDMS workspace is still being connected.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing sample analytics because DATABASE_URL is not configured in this environment.";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    return "Showing sample analytics until the EDMS database migrations are applied.";
  }

  return "Showing sample analytics while the live EDMS workspace is still being connected.";
}
