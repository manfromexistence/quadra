import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { activityLog } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { getProjectAccessScope } from "./access";
import {
  formatStoredAbsoluteDate,
  formatStoredTimestamp,
  getStoredDateTime,
  normalizeStoredDate,
} from "./dates";
import type { DashboardSessionUser } from "./session";

type DerivedState = {
  isUsingFallbackData: boolean;
  statusMessage: string | null;
};

type WorkspaceDataset = DerivedState & {
  projects: Array<{
    id: string;
    name: string;
    projectNumber: string | null;
    location: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }>;
  documents: Array<{
    id: string;
    projectId: string;
    documentNumber: string;
    title: string;
    discipline: string | null;
    category: string | null;
    status: string;
    revision: string | null;
    uploadedAt: Date | null;
    projectName: string;
  }>;
  workflows: Array<{
    id: string;
    workflowId: string;
    projectId: string;
    stepName: string;
    status: string;
    assignedRole: string | null;
    assignedToName: string;
    dueDate: Date | null;
    documentNumber: string;
    documentTitle: string;
    projectName: string;
  }>;
  transmittals: Array<{
    id: string;
    projectId: string;
    transmittalNumber: string;
    subject: string;
    status: string;
    createdAt: Date | null;
    sentAt: Date | null;
    sentTo: string;
    projectName: string;
  }>;
  transmittalDocuments: Array<{
    transmittalId: string;
    documentId: string;
    documentNumber: string;
    title: string;
    discipline: string | null;
    category: string | null;
    projectId: string;
  }>;
  members: Array<{
    projectId: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    organization: string | null;
  }>;
  activity: Array<{
    id: string;
    projectId: string | null;
    action: string;
    entityType: string;
    entityName: string | null;
    description: string | null;
    actorName: string;
    projectName: string | null;
    createdAt: Date | null;
  }>;
};

export interface ScheduleActivityRow {
  id: string;
  code: string;
  name: string;
  phase: "engineering" | "procurement" | "construction" | "commissioning";
  startLabel: string;
  endLabel: string;
  planned: number;
  actual: number;
  linkedDocs: number;
  openWorkflowItems: number;
  transmittals: number;
  startPct: number;
  widthPct: number;
  status: string;
  projectId: string;
}

export interface SchedulePageData extends DerivedState {
  activities: ScheduleActivityRow[];
  metrics: Array<{
    label: string;
    value: string;
    description: string;
    tone: "blue" | "emerald" | "amber" | "rose";
    icon: "documents" | "reviews" | "transmittals" | "notifications";
  }>;
  phaseSummaries: Array<{
    phase: ScheduleActivityRow["phase"];
    actualAverage: number;
    plannedAverage: number;
  }>;
}

export interface DatabookSectionRow {
  code: string;
  title: string;
  required: number;
  collected: number;
  pending: number;
  missing: number;
  docs: Array<{
    code: string;
    title: string;
    status: "collected" | "pending" | "missing";
    projectName: string;
  }>;
}

export interface DatabookPageData extends DerivedState {
  sections: DatabookSectionRow[];
  totalRequired: number;
  totalCollected: number;
  totalPending: number;
  totalMissing: number;
  targetLabel: string;
}

export interface MatrixStakeholder {
  id: string;
  projectId: string;
  name: string;
  role: string;
  short: string;
  email: string;
}

export interface MatrixRow {
  key: string;
  discipline: string;
  docType: string;
  issuedDocuments: number;
  distribution: Record<string, number>;
}

export interface MatrixPageData extends DerivedState {
  stakeholders: MatrixStakeholder[];
  rows: MatrixRow[];
  totalLinks: number;
}

export interface AuditEntryRow {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  actionLabel: string;
  detail: string;
  entityType: string;
  entityCode: string;
  projectCode: string;
}

export interface AuditPageData extends DerivedState {
  entries: AuditEntryRow[];
  metrics: Array<{
    label: string;
    value: string;
    description: string;
    tone: "blue" | "emerald" | "amber" | "rose";
    icon: "documents" | "reviews" | "transmittals" | "notifications";
  }>;
}

export interface ReportPreviewRow {
  code: string;
  title: string;
  discipline: string;
  rev: string;
  status: string;
}

export interface ReportsPageData extends DerivedState {
  previewRows: ReportPreviewRow[];
  lastGeneratedLabel: string;
}

export async function getSchedulePageData(
  sessionUser: DashboardSessionUser,
): Promise<SchedulePageData> {
  const dataset = await getWorkspaceDataset(sessionUser);
  const activities = deriveScheduleActivities(
    dataset.projects,
    dataset.documents,
    dataset.workflows,
    dataset.transmittals,
  );

  const completed = activities.filter(
    (activity) => activity.actual >= 100,
  ).length;
  const active = activities.filter(
    (activity) => activity.status === "active",
  ).length;
  const behind = activities.filter(
    (activity) => activity.actual < activity.planned,
  ).length;

  return {
    isUsingFallbackData: dataset.isUsingFallbackData,
    statusMessage: dataset.statusMessage,
    activities,
    metrics: [
      {
        label: "Scheduled projects",
        value: formatCount(activities.length),
        description:
          "Live project schedules derived from the EDMS portfolio and current date plan.",
        tone: "blue",
        icon: "documents",
      },
      {
        label: "Completed",
        value: formatCount(completed),
        description: "Projects whose actual progress has reached 100%.",
        tone: "emerald",
        icon: "reviews",
      },
      {
        label: "Active",
        value: formatCount(active),
        description:
          "Projects still moving through the current delivery cycle.",
        tone: "amber",
        icon: "transmittals",
      },
      {
        label: "Behind plan",
        value: formatCount(behind),
        description:
          "Projects where EDMS completion is tracking below planned time progress.",
        tone: "rose",
        icon: "notifications",
      },
    ],
    phaseSummaries: (
      ["engineering", "procurement", "construction", "commissioning"] as const
    ).map((phase) => {
      const phaseRows = activities.filter(
        (activity) => activity.phase === phase,
      );
      return {
        phase,
        actualAverage: average(phaseRows.map((row) => row.actual)),
        plannedAverage: average(phaseRows.map((row) => row.planned)),
      };
    }),
  };
}

export async function getDatabookPageData(
  sessionUser: DashboardSessionUser,
): Promise<DatabookPageData> {
  const dataset = await getWorkspaceDataset(sessionUser);
  const sectionMap = new Map<string, DatabookSectionRow>();

  for (const document of dataset.documents) {
    const title =
      document.category?.trim() ||
      document.discipline?.trim() ||
      "Uncategorized";
    const key = title.toLowerCase();

    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        code: `SEC-${String(sectionMap.size + 1).padStart(2, "0")}`,
        title,
        required: 0,
        collected: 0,
        pending: 0,
        missing: 0,
        docs: [],
      });
    }

    const section = sectionMap.get(key)!;
    section.required += 1;

    const normalizedStatus = toDatabookStatus(document.status);
    if (normalizedStatus === "collected") {
      section.collected += 1;
    } else if (normalizedStatus === "pending") {
      section.pending += 1;
    } else {
      section.missing += 1;
    }

    if (section.docs.length < 5) {
      section.docs.push({
        code: document.documentNumber,
        title: document.title,
        status: normalizedStatus,
        projectName: document.projectName,
      });
    }
  }

  const sections = Array.from(sectionMap.values()).sort(
    (left, right) =>
      right.required - left.required || left.title.localeCompare(right.title),
  );
  const targetDate = dataset.projects
    .map((project) => project.endDate)
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => getStoredDateTime(left) - getStoredDateTime(right))
    .at(-1);

  return {
    isUsingFallbackData: dataset.isUsingFallbackData,
    statusMessage: dataset.statusMessage,
    sections,
    totalRequired: sections.reduce((sum, section) => sum + section.required, 0),
    totalCollected: sections.reduce(
      (sum, section) => sum + section.collected,
      0,
    ),
    totalPending: sections.reduce((sum, section) => sum + section.pending, 0),
    totalMissing: sections.reduce((sum, section) => sum + section.missing, 0),
    targetLabel: targetDate
      ? formatAbsoluteDate(targetDate)
      : "Target date pending",
  };
}

export async function getMatrixPageData(
  sessionUser: DashboardSessionUser,
): Promise<MatrixPageData> {
  const dataset = await getWorkspaceDataset(sessionUser);
  const recipientMaps = dataset.transmittals.reduce<Record<string, string[]>>(
    (acc, transmittal) => {
      acc[transmittal.id] = parseRecipients(transmittal.sentTo);
      return acc;
    },
    {},
  );

  const stakeholders = Array.from(
    new Map(
      dataset.members.map((member) => [
        member.userId,
        {
          id: member.userId,
          projectId: member.projectId,
          name: member.name,
          role: member.role,
          short: abbreviateStakeholder(member.name),
          email: member.email,
        } satisfies MatrixStakeholder,
      ]),
    ).values(),
  ).sort((left, right) => left.name.localeCompare(right.name));

  const rowMap = new Map<string, MatrixRow>();

  for (const document of dataset.documents) {
    const discipline = document.discipline?.trim() || "General";
    const docType = document.category?.trim() || "Document";
    const key = `${discipline}:${docType}`;

    if (!rowMap.has(key)) {
      rowMap.set(key, {
        key,
        discipline,
        docType,
        issuedDocuments: 0,
        distribution: {},
      });
    }
  }

  for (const transmittalDocument of dataset.transmittalDocuments) {
    const discipline = transmittalDocument.discipline?.trim() || "General";
    const docType = transmittalDocument.category?.trim() || "Document";
    const key = `${discipline}:${docType}`;
    const row = rowMap.get(key);

    if (!row) {
      continue;
    }

    row.issuedDocuments += 1;
    for (const recipientId of recipientMaps[
      transmittalDocument.transmittalId
    ] ?? []) {
      row.distribution[recipientId] = (row.distribution[recipientId] ?? 0) + 1;
    }
  }

  const rows = Array.from(rowMap.values()).sort(
    (left, right) =>
      right.issuedDocuments - left.issuedDocuments ||
      left.discipline.localeCompare(right.discipline),
  );
  const totalLinks = rows.reduce(
    (sum, row) =>
      sum +
      Object.values(row.distribution).reduce(
        (rowSum, value) => rowSum + value,
        0,
      ),
    0,
  );

  return {
    isUsingFallbackData: dataset.isUsingFallbackData,
    statusMessage: dataset.statusMessage,
    stakeholders,
    rows,
    totalLinks,
  };
}

export async function getAuditPageData(
  sessionUser: DashboardSessionUser,
  filters: { query?: string; entityType?: string },
): Promise<AuditPageData> {
  const dataset = await getWorkspaceDataset(sessionUser);
  const normalizedQuery = filters.query?.trim().toLowerCase() ?? "";

  const entries = dataset.activity
    .filter((entry) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        entry.actorName.toLowerCase().includes(normalizedQuery) ||
        entry.action.toLowerCase().includes(normalizedQuery) ||
        (entry.entityName ?? "").toLowerCase().includes(normalizedQuery) ||
        (entry.description ?? "").toLowerCase().includes(normalizedQuery) ||
        (entry.projectName ?? "").toLowerCase().includes(normalizedQuery);
      const matchesType =
        !filters.entityType || filters.entityType.trim().length === 0
          ? true
          : entry.entityType === filters.entityType;

      return matchesQuery && matchesType;
    })
    .map((entry) => ({
      id: entry.id,
      timestamp: entry.createdAt
        ? formatTimestamp(entry.createdAt)
        : "Timestamp pending",
      actor: entry.actorName,
      actorRole: deriveAuditActorRole(entry.action, entry.entityType),
      action: entry.action,
      actionLabel: formatLabel(entry.action),
      detail: entry.description || "No additional detail recorded.",
      entityType: entry.entityType,
      entityCode: entry.entityName || entry.id,
      projectCode: entry.projectName || "Workspace",
    }));

  return {
    isUsingFallbackData: dataset.isUsingFallbackData,
    statusMessage: dataset.statusMessage,
    entries,
    metrics: [
      {
        label: "Total events",
        value: formatCount(entries.length),
        description:
          "All recorded activity-log events visible in the current filter window.",
        tone: "blue",
        icon: "documents",
      },
      {
        label: "Document events",
        value: formatCount(
          entries.filter((entry) => entry.entityType === "document").length,
        ),
        description:
          "Uploads, revisions, approvals, and other controlled-document activity.",
        tone: "emerald",
        icon: "reviews",
      },
      {
        label: "Workflow events",
        value: formatCount(
          entries.filter((entry) => entry.entityType === "workflow").length,
        ),
        description:
          "Review-step decisions, assignments, and workflow routing changes.",
        tone: "amber",
        icon: "transmittals",
      },
      {
        label: "Transmittal events",
        value: formatCount(
          entries.filter((entry) => entry.entityType === "transmittal").length,
        ),
        description:
          "Formal issue and acknowledgement events tied to outgoing packages.",
        tone: "rose",
        icon: "notifications",
      },
    ],
  };
}

export async function getReportsPageData(
  sessionUser: DashboardSessionUser,
): Promise<ReportsPageData> {
  const dataset = await getWorkspaceDataset(sessionUser);
  const previewRows = dataset.documents
    .slice()
    .sort(
      (left, right) =>
        getStoredDateTime(right.uploadedAt) -
        getStoredDateTime(left.uploadedAt),
    )
    .slice(0, 5)
    .map((document) => ({
      code: document.documentNumber,
      title: document.title,
      discipline: document.discipline || document.category || "General",
      rev: document.revision || "-",
      status: document.status,
    }));

  const lastGeneratedSource = [
    ...dataset.activity.map((entry) => entry.createdAt),
    ...dataset.documents.map((entry) => entry.uploadedAt),
    ...dataset.transmittals.map((entry) => entry.createdAt),
  ]
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => getStoredDateTime(right) - getStoredDateTime(left))
    .at(0);

  return {
    isUsingFallbackData: dataset.isUsingFallbackData,
    statusMessage: dataset.statusMessage,
    previewRows,
    lastGeneratedLabel: lastGeneratedSource
      ? formatAbsoluteDate(lastGeneratedSource)
      : "Generation date pending",
  };
}

async function getWorkspaceDataset(
  sessionUser: DashboardSessionUser,
): Promise<WorkspaceDataset> {
  try {
    const accessScope = await getProjectAccessScope(sessionUser);
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
    const scopedActivityCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(activityLog.projectId, accessScope.projectIds)
        : null;
    const scopedMemberCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(projectMembers.projectId, accessScope.projectIds)
        : null;

    const [
      projectRows,
      documentRows,
      workflowRows,
      transmittalRows,
      transmittalDocumentRows,
      memberRows,
      activityRows,
    ] = await Promise.all([
      scopedProjectCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: projects.id,
              name: projects.name,
              projectNumber: projects.projectNumber,
              location: projects.location,
              status: projects.status,
              startDate: projects.startDate,
              endDate: projects.endDate,
              createdAt: projects.createdAt,
              updatedAt: projects.updatedAt,
            })
            .from(projects)
            .where(scopedProjectCondition)
            .orderBy(desc(projects.updatedAt)),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: documents.id,
              projectId: documents.projectId,
              documentNumber: documents.documentNumber,
              title: documents.title,
              discipline: documents.discipline,
              category: documents.category,
              status: documents.status,
              revision: documents.revision,
              uploadedAt: documents.uploadedAt,
              projectName: projects.name,
            })
            .from(documents)
            .innerJoin(projects, eq(documents.projectId, projects.id))
            .where(scopedDocumentCondition)
            .orderBy(desc(documents.uploadedAt)),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: workflowSteps.id,
              workflowId: documentWorkflows.id,
              projectId: documents.projectId,
              stepName: workflowSteps.stepName,
              status: workflowSteps.status,
              assignedRole: workflowSteps.assignedRole,
              assignedToName: userTable.name,
              dueDate: workflowSteps.dueDate,
              documentNumber: documents.documentNumber,
              documentTitle: documents.title,
              projectName: projects.name,
            })
            .from(workflowSteps)
            .innerJoin(
              documentWorkflows,
              eq(workflowSteps.workflowId, documentWorkflows.id),
            )
            .innerJoin(
              documents,
              eq(documentWorkflows.documentId, documents.id),
            )
            .innerJoin(projects, eq(documents.projectId, projects.id))
            .leftJoin(userTable, eq(workflowSteps.assignedTo, userTable.id))
            .where(scopedDocumentCondition)
            .orderBy(
              asc(workflowSteps.dueDate),
              desc(documentWorkflows.startedAt),
            ),
      scopedTransmittalCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: transmittals.id,
              projectId: transmittals.projectId,
              transmittalNumber: transmittals.transmittalNumber,
              subject: transmittals.subject,
              status: transmittals.status,
              createdAt: transmittals.createdAt,
              sentAt: transmittals.sentAt,
              sentTo: transmittals.sentTo,
              projectName: projects.name,
            })
            .from(transmittals)
            .innerJoin(projects, eq(transmittals.projectId, projects.id))
            .where(scopedTransmittalCondition)
            .orderBy(desc(transmittals.createdAt)),
      scopedTransmittalCondition === null
        ? Promise.resolve([])
        : db
            .select({
              transmittalId: transmittalDocuments.transmittalId,
              documentId: transmittalDocuments.documentId,
              documentNumber: documents.documentNumber,
              title: documents.title,
              discipline: documents.discipline,
              category: documents.category,
              projectId: transmittals.projectId,
            })
            .from(transmittalDocuments)
            .innerJoin(
              transmittals,
              eq(transmittalDocuments.transmittalId, transmittals.id),
            )
            .innerJoin(
              documents,
              eq(transmittalDocuments.documentId, documents.id),
            )
            .where(scopedTransmittalCondition),
      scopedMemberCondition === null
        ? Promise.resolve([])
        : db
            .select({
              projectId: projectMembers.projectId,
              userId: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: projectMembers.role,
              organization: userTable.organization,
            })
            .from(projectMembers)
            .innerJoin(userTable, eq(projectMembers.userId, userTable.id))
            .where(scopedMemberCondition)
            .orderBy(asc(userTable.name)),
      scopedActivityCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: activityLog.id,
              projectId: activityLog.projectId,
              action: activityLog.action,
              entityType: activityLog.entityType,
              entityName: activityLog.entityName,
              description: activityLog.description,
              actorName: userTable.name,
              projectName: projects.name,
              createdAt: activityLog.createdAt,
            })
            .from(activityLog)
            .leftJoin(userTable, eq(activityLog.userId, userTable.id))
            .leftJoin(projects, eq(activityLog.projectId, projects.id))
            .where(scopedActivityCondition)
            .orderBy(desc(activityLog.createdAt)),
    ]);

    return {
      projects: projectRows.map((row) => ({
        id: String(row.id),
        name: row.name,
        projectNumber: row.projectNumber,
        location: row.location,
        status: row.status,
        startDate: normalizeStoredDate(row.startDate),
        endDate: normalizeStoredDate(row.endDate),
        createdAt: normalizeStoredDate(row.createdAt),
        updatedAt: normalizeStoredDate(row.updatedAt),
      })),
      documents: documentRows.map((row) => ({
        id: String(row.id),
        projectId: String(row.projectId),
        documentNumber: row.documentNumber,
        title: row.title,
        discipline: row.discipline,
        category: row.category,
        status: row.status,
        revision: row.revision,
        uploadedAt: normalizeStoredDate(row.uploadedAt),
        projectName: row.projectName,
      })),
      workflows: workflowRows.map((row) => ({
        id: String(row.id),
        workflowId: String(row.workflowId),
        projectId: String(row.projectId),
        stepName: row.stepName,
        status: row.status,
        assignedRole: row.assignedRole,
        assignedToName: row.assignedToName ?? "Unassigned",
        dueDate: normalizeStoredDate(row.dueDate),
        documentNumber: row.documentNumber,
        documentTitle: row.documentTitle,
        projectName: row.projectName,
      })),
      transmittals: transmittalRows.map((row) => ({
        id: String(row.id),
        projectId: String(row.projectId),
        transmittalNumber: row.transmittalNumber,
        subject: row.subject,
        status: row.status,
        createdAt: normalizeStoredDate(row.createdAt),
        sentAt: normalizeStoredDate(row.sentAt),
        sentTo: row.sentTo,
        projectName: row.projectName,
      })),
      transmittalDocuments: transmittalDocumentRows.map((row) => ({
        transmittalId: String(row.transmittalId),
        documentId: String(row.documentId),
        documentNumber: row.documentNumber,
        title: row.title,
        discipline: row.discipline,
        category: row.category,
        projectId: String(row.projectId),
      })),
      members: memberRows.map((row) => ({
        projectId: String(row.projectId),
        userId: String(row.userId),
        name: row.name,
        email: row.email,
        role: row.role,
        organization: row.organization,
      })),
      activity: activityRows.map((row) => ({
        id: String(row.id),
        projectId: row.projectId ? String(row.projectId) : null,
        action: row.action,
        entityType: row.entityType,
        entityName: row.entityName,
        description: row.description,
        actorName: row.actorName ?? "System",
        projectName: row.projectName,
        createdAt: normalizeStoredDate(row.createdAt),
      })),
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    return {
      projects: [],
      documents: [],
      workflows: [],
      transmittals: [],
      transmittalDocuments: [],
      members: [],
      activity: [],
      isUsingFallbackData: true,
      statusMessage: getFallbackMessage(error),
    };
  }
}

function deriveScheduleActivities(
  projectRows: WorkspaceDataset["projects"],
  documentRows: WorkspaceDataset["documents"],
  workflowRows: WorkspaceDataset["workflows"],
  transmittalRows: WorkspaceDataset["transmittals"],
) {
  if (projectRows.length === 0) {
    return [];
  }

  const timelineStart = projectRows
    .map((project) => project.startDate ?? project.createdAt ?? new Date())
    .sort(
      (left, right) => getStoredDateTime(left) - getStoredDateTime(right),
    )[0];
  const timelineEnd = projectRows
    .map(
      (project) =>
        project.endDate ?? project.updatedAt ?? addDays(new Date(), 90),
    )
    .sort(
      (left, right) => getStoredDateTime(right) - getStoredDateTime(left),
    )[0];
  const totalTimelineDuration = Math.max(
    getStoredDateTime(timelineEnd) - getStoredDateTime(timelineStart),
    1,
  );

  return projectRows.map((project, index) => {
    const projectDocuments = documentRows.filter(
      (document) => document.projectId === project.id,
    );
    const projectWorkflows = workflowRows.filter(
      (workflow) => workflow.projectId === project.id,
    );
    const projectTransmittals = transmittalRows.filter(
      (transmittal) => transmittal.projectId === project.id,
    );
    const approvedDocuments = projectDocuments.filter(
      (document) => document.status === "approved",
    ).length;
    const openWorkflowItems = projectWorkflows.filter((workflow) =>
      ["pending", "in_progress"].includes(workflow.status),
    ).length;
    const planned = calculatePlannedProgress(
      project.startDate,
      project.endDate,
    );
    const actual =
      project.status === "completed"
        ? 100
        : projectDocuments.length > 0
          ? Math.min(
              100,
              Math.round((approvedDocuments / projectDocuments.length) * 100),
            )
          : 0;
    const startDate = project.startDate ?? project.createdAt ?? timelineStart;
    const endDate =
      project.endDate ?? project.updatedAt ?? addDays(startDate, 90);

    return {
      id: project.id,
      code:
        project.projectNumber ?? `PRJ-${String(index + 1).padStart(3, "0")}`,
      name: project.name,
      phase: deriveProjectPhase(planned, project.status),
      startLabel: formatAbsoluteDate(startDate),
      endLabel: formatAbsoluteDate(endDate),
      planned,
      actual,
      linkedDocs: projectDocuments.length,
      openWorkflowItems,
      transmittals: projectTransmittals.length,
      startPct: clampPercentage(
        ((getStoredDateTime(startDate) - getStoredDateTime(timelineStart)) /
          totalTimelineDuration) *
          100,
      ),
      widthPct: Math.max(
        6,
        clampPercentage(
          ((getStoredDateTime(endDate) - getStoredDateTime(startDate)) /
            totalTimelineDuration) *
            100,
        ),
      ),
      status: project.status,
      projectId: project.id,
    } satisfies ScheduleActivityRow;
  });
}

function deriveProjectPhase(
  planned: number,
  status: string,
): ScheduleActivityRow["phase"] {
  if (status === "completed" || planned >= 85) {
    return "commissioning";
  }
  if (planned >= 55) {
    return "construction";
  }
  if (planned >= 25) {
    return "procurement";
  }
  return "engineering";
}

function calculatePlannedProgress(
  startDate: Date | null,
  endDate: Date | null,
) {
  if (!startDate || !endDate || endDate <= startDate) {
    return 0;
  }

  const now = new Date();
  if (now <= startDate) {
    return 0;
  }
  if (now >= endDate) {
    return 100;
  }

  return clampPercentage(
    ((now.getTime() - getStoredDateTime(startDate)) /
      (getStoredDateTime(endDate) - getStoredDateTime(startDate))) *
      100,
  );
}

function toDatabookStatus(status: string): "collected" | "pending" | "missing" {
  if (status === "approved") {
    return "collected";
  }
  if (["submitted", "under_review"].includes(status)) {
    return "pending";
  }
  return "missing";
}

function parseRecipients(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.trim().length > 0,
        )
      : [];
  } catch {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }
}

function deriveAuditActorRole(action: string, entityType: string) {
  if (entityType === "workflow") {
    return "Workflow";
  }
  if (entityType === "transmittal") {
    return "Document Control";
  }
  if (action.includes("system") || action.includes("reminder")) {
    return "Automated";
  }
  return "Workspace";
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}

function formatTimestamp(date: Date) {
  return formatStoredTimestamp(date) ?? "Timestamp pending";
}

function formatAbsoluteDate(date: Date) {
  return formatStoredAbsoluteDate(date) ?? "Date pending";
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing live page structure with empty EDMS data because the workspace dataset could not be loaded.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing empty EDMS views because DATABASE_URL is not configured in this environment.";
  }

  return "Showing empty EDMS views because the Turso-backed workspace dataset could not be loaded.";
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function abbreviateStakeholder(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
