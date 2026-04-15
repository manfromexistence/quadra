import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import type { DashboardSessionUser } from "./session";

export interface EdmsNotificationFeedItem {
  id: string;
  type: string;
  title: string;
  message: string;
  projectName: string | null;
  documentTitle: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: Date | null;
  createdLabel: string;
}

export async function getEdmsNotificationFeed(
  sessionUser: DashboardSessionUser,
  limit = 12
) {
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      projectName: projects.name,
      documentTitle: documents.title,
      relatedEntityType: notifications.relatedEntityType,
      relatedEntityId: notifications.relatedEntityId,
      actionUrl: notifications.actionUrl,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .leftJoin(projects, eq(notifications.projectId, projects.id))
    .leftJoin(documents, eq(notifications.documentId, documents.id))
    .where(eq(notifications.userId, sessionUser.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    projectName: row.projectName,
    documentTitle: row.documentTitle,
    relatedEntityType: row.relatedEntityType,
    relatedEntityId: row.relatedEntityId,
    actionUrl: row.actionUrl,
    isRead: row.isRead,
    createdAt: row.createdAt,
    createdLabel: formatDateLabel(row.createdAt),
  })) satisfies EdmsNotificationFeedItem[];
}

export async function getEdmsUnreadNotificationCount(sessionUser: DashboardSessionUser) {
  const [row] = await db
    .select({
      value: count(),
    })
    .from(notifications)
    .where(and(eq(notifications.userId, sessionUser.id), eq(notifications.isRead, false)));

  return Number(row?.value ?? 0);
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
