import "server-only";

import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { getProjectAccessScope } from "./access";
import { type DashboardMetric, getEdmsDashboardData } from "./dashboard";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface TransmittalProjectOption {
  id: string;
  name: string;
  projectNumber: string | null;
}

export interface TransmittalMemberOption {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: string;
}

export interface TransmittalDocumentOption {
  id: string;
  projectId: string;
  documentNumber: string;
  title: string;
  revision: string | null;
  status: string | null;
}

export interface TransmittalSummary {
  id: string;
  transmittalNumber: string;
  subject: string;
  projectName: string;
  status: string;
  sentLabel: string;
  recipientName: string;
  documentCount: string;
  isActionable: boolean;
  documentCodes?: string[];
  purpose?: string;
  dueDate?: string;
}

export interface TransmittalManagementData {
  metrics: DashboardMetric[];
  projects: TransmittalProjectOption[];
  members: TransmittalMemberOption[];
  documents: TransmittalDocumentOption[];
  transmittals: TransmittalSummary[];
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

export async function getTransmittalManagementData(
  sessionUser: DashboardSessionUser,
): Promise<TransmittalManagementData> {
  try {
    const accessScope = await getProjectAccessScope(sessionUser);
    const scopedTransmittalCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(transmittals.projectId, accessScope.projectIds)
        : null;
    const scopedProjectCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(projects.id, accessScope.projectIds)
        : null;
    const scopedMemberCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(projectMembers.projectId, accessScope.projectIds)
        : null;
    const scopedDocumentCondition = accessScope.isAdmin
      ? undefined
      : accessScope.projectIds.length > 0
        ? inArray(documents.projectId, accessScope.projectIds)
        : null;

    const [
      transmittalCountRows,
      acknowledgedRows,
      sentRows,
      notificationRows,
      projectRows,
      memberRows,
      documentRows,
      transmittalRows,
    ] = await Promise.all([
      scopedTransmittalCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(transmittals)
            .where(scopedTransmittalCondition),
      scopedTransmittalCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(transmittals)
            .where(
              and(
                eq(transmittals.status, "acknowledged"),
                scopedTransmittalCondition,
              ),
            ),
      scopedTransmittalCondition === null
        ? Promise.resolve([{ value: 0 }])
        : db
            .select({ value: count() })
            .from(transmittals)
            .where(
              and(eq(transmittals.status, "sent"), scopedTransmittalCondition),
            ),
      db
        .select({ value: count() })
        .from(notifications)
        .where(eq(notifications.userId, sessionUser.id)),
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
            .orderBy(asc(projects.name)),
      scopedMemberCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: userTable.id,
              projectId: projectMembers.projectId,
              name: userTable.name,
              email: userTable.email,
              role: projectMembers.role,
            })
            .from(projectMembers)
            .innerJoin(userTable, eq(projectMembers.userId, userTable.id))
            .where(scopedMemberCondition)
            .orderBy(asc(userTable.name)),
      scopedDocumentCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: documents.id,
              projectId: documents.projectId,
              documentNumber: documents.documentNumber,
              title: documents.title,
              revision: documents.revision,
              status: documents.status,
            })
            .from(documents)
            .where(scopedDocumentCondition)
            .orderBy(desc(documents.uploadedAt)),
      scopedTransmittalCondition === null
        ? Promise.resolve([])
        : db
            .select({
              id: transmittals.id,
              transmittalNumber: transmittals.transmittalNumber,
              subject: transmittals.subject,
              projectName: projects.name,
              status: transmittals.status,
              purpose: transmittals.purpose,
              dueDate: transmittals.dueDate,
              sentAt: transmittals.sentAt,
              createdAt: transmittals.createdAt,
              sentTo: transmittals.sentTo,
              recipientName: userTable.name,
              documentCount: count(transmittalDocuments.id),
            })
            .from(transmittals)
            .innerJoin(projects, eq(transmittals.projectId, projects.id))
            .leftJoin(userTable, eq(transmittals.acknowledgedBy, userTable.id))
            .leftJoin(
              transmittalDocuments,
              eq(transmittalDocuments.transmittalId, transmittals.id),
            )
            .where(scopedTransmittalCondition)
            .groupBy(
              transmittals.id,
              transmittals.transmittalNumber,
              transmittals.subject,
              projects.name,
              transmittals.status,
              transmittals.purpose,
              transmittals.dueDate,
              transmittals.sentAt,
              transmittals.createdAt,
              transmittals.sentTo,
              userTable.name,
            )
            .orderBy(desc(transmittals.createdAt))
            .limit(24),
    ]);

    const [transmittalCount] = transmittalCountRows;
    const [acknowledgedCount] = acknowledgedRows;
    const [sentCount] = sentRows;
    const [notificationCount] = notificationRows;

    // Fetch document codes for each transmittal
    const transmittalIds = transmittalRows.map((t) => t.id);
    const transmittalDocsMap = new Map<string, string[]>();

    if (transmittalIds.length > 0) {
      const transmittalDocs = await db
        .select({
          transmittalId: transmittalDocuments.transmittalId,
          documentNumber: documents.documentNumber,
        })
        .from(transmittalDocuments)
        .innerJoin(documents, eq(transmittalDocuments.documentId, documents.id))
        .where(inArray(transmittalDocuments.transmittalId, transmittalIds));

      for (const doc of transmittalDocs) {
        const codes = transmittalDocsMap.get(doc.transmittalId) || [];
        codes.push(doc.documentNumber);
        transmittalDocsMap.set(doc.transmittalId, codes);
      }
    }

    return {
      metrics: [
        {
          label: "Issued packages",
          value: formatCount(transmittalCount?.value),
          description: "Formal document issues currently tracked in the EDMS.",
          tone: "rose",
          icon: "transmittals",
        },
        {
          label: "Awaiting acknowledgement",
          value: formatCount(sentCount?.value),
          description:
            "Packages that have been sent but not yet acknowledged by recipients.",
          tone: "amber",
          icon: "transmittals",
        },
        {
          label: "Acknowledged",
          value: formatCount(acknowledgedCount?.value),
          description: "Packages confirmed by the recipient team.",
          tone: "emerald",
          icon: "notifications",
        },
        {
          label: "Linked alerts",
          value: formatCount(notificationCount?.value),
          description:
            "Notifications tied to delivery and acknowledgement activity.",
          tone: "slate",
          icon: "notifications",
        },
      ],
      projects: projectRows.map((project) => ({
        id: String(project.id),
        name: project.name,
        projectNumber: project.projectNumber,
      })),
      members: memberRows.map((member) => ({
        id: member.id,
        projectId: String(member.projectId),
        name: member.name,
        email: member.email,
        role: member.role,
      })),
      documents: documentRows.map((document) => ({
        id: String(document.id),
        projectId: String(document.projectId),
        documentNumber: document.documentNumber,
        title: document.title,
        revision: document.revision ?? null,
        status: document.status ?? null,
      })),
      transmittals: transmittalRows.map((transmittal) => ({
        id: String(transmittal.id),
        transmittalNumber: transmittal.transmittalNumber,
        subject: transmittal.subject,
        projectName: transmittal.projectName,
        status: transmittal.status,
        purpose: transmittal.purpose || "IFR",
        dueDate: transmittal.dueDate
          ? formatStoredAbsoluteDate(transmittal.dueDate)
          : undefined,
        sentLabel: formatDateLabel(transmittal.sentAt ?? transmittal.createdAt),
        recipientName: parseRecipientLabel(transmittal.sentTo, memberRows),
        documentCount: formatCount(transmittal.documentCount),
        documentCodes: transmittalDocsMap.get(transmittal.id) || [],
        isActionable:
          transmittal.status === "sent" &&
          parseRecipients(transmittal.sentTo).includes(sessionUser.id),
      })),
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    return createFallbackTransmittalData(sessionUser, error);
  }
}

async function createFallbackTransmittalData(
  sessionUser: DashboardSessionUser,
  error: unknown,
): Promise<TransmittalManagementData> {
  const dashboard = await getEdmsDashboardData(sessionUser);

  return {
    metrics: [
      {
        label: "Issued packages",
        value: String(dashboard.transmittals.length),
        description:
          "Sample transmittals while the database is still being prepared.",
        tone: "rose",
        icon: "transmittals",
      },
      {
        label: "Awaiting acknowledgement",
        value: String(
          dashboard.transmittals.filter((item) => item.status === "sent")
            .length,
        ),
        description: "Sample packages still awaiting recipient confirmation.",
        tone: "amber",
        icon: "transmittals",
      },
      {
        label: "Acknowledged",
        value: "1",
        description: "Sample acknowledged package count in fallback mode.",
        tone: "emerald",
        icon: "notifications",
      },
      {
        label: "Linked alerts",
        value: String(dashboard.notifications.length),
        description: "Sample notification volume tied to transmittal activity.",
        tone: "slate",
        icon: "notifications",
      },
    ],
    projects: dashboard.projects.map((project) => ({
      id: project.id,
      name: project.name,
      projectNumber: project.projectNumber,
    })),
    members: [
      {
        id: sessionUser.id,
        projectId: "fallback-project-1",
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
      },
      {
        id: "fallback-member-2",
        projectId: "fallback-project-1",
        name: "Ayesha Karim",
        email: "ayesha.karim@example.com",
        role: "pmc",
      },
      {
        id: "fallback-member-3",
        projectId: "fallback-project-1",
        name: "Nadia Islam",
        email: "nadia.islam@example.com",
        role: "client",
      },
    ],
    documents: dashboard.documents.map((document, index) => ({
      id: document.id,
      projectId: `fallback-project-${index + 1}`,
      documentNumber: document.documentNumber,
      title: document.title,
      revision: null,
      status: null,
    })),
    transmittals: dashboard.transmittals.map((item, index) => ({
      id: item.id,
      transmittalNumber: item.transmittalNumber,
      subject: item.subject,
      projectName: item.projectName,
      status: item.status,
      purpose: index % 3 === 0 ? "IFR" : index % 3 === 1 ? "IFA" : "IFC",
      dueDate: index === 0 ? "2026-04-27" : undefined,
      sentLabel: item.sentLabel,
      recipientName: index === 0 ? sessionUser.name : "Ayesha Karim",
      documentCount: "2",
      documentCodes: [`DOC-${index + 1}`, `DOC-${index + 2}`],
      isActionable: index === 0 && item.status === "sent",
    })),
    isUsingFallbackData: true,
    statusMessage: getFallbackMessage(error),
  };
}

function parseRecipients(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }
}

function parseRecipientLabel(
  value: string,
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
    projectId: string;
  }[],
) {
  const [firstRecipient] = parseRecipients(value);

  if (!firstRecipient) {
    return "Recipient pending";
  }

  return (
    members.find((member) => member.id === firstRecipient)?.name ??
    "Recipient pending"
  );
}

function formatCount(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return "Updated date pending";
  }

  return `Updated ${formatStoredAbsoluteDate(date) ?? "date pending"}`;
}

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing sample transmittal data while the live EDMS workspace is still being connected.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing sample transmittal data because DATABASE_URL is not configured in this environment.";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    return "Showing sample transmittal data until the EDMS database migrations are applied.";
  }

  return "Showing sample transmittal data while the live EDMS workspace is still being connected.";
}
