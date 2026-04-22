import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projectMembers, projects } from "@/db/schema/projects";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { getProjectAccessScope } from "./access";
import type { DashboardMetric } from "./dashboard";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export async function getTransmittals(projectId: string) {
  try {
    const transmittalRows = await db
      .select({
        id: transmittals.id,
        transmittalNumber: transmittals.transmittalNumber,
        subject: transmittals.subject,
        status: transmittals.status,
        sentTo: transmittals.sentTo,
        purpose: transmittals.purpose,
        documentCount: transmittals.documentCount,
        createdAt: transmittals.createdAt,
      })
      .from(transmittals)
      .where(eq(transmittals.projectId, projectId))
      .orderBy(desc(transmittals.createdAt))
      .limit(50);

    return transmittalRows;
  } catch (error) {
    console.error("Error fetching transmittals:", error);
    return [];
  }
}

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
    console.error("Error fetching transmittal dashboard data:", error);
    throw error;
  }
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
