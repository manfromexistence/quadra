import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scheduleActivities, scheduleSync } from "@/db/schema/schedule";

export async function getScheduleActivities(projectId: string) {
  const activities = await db
    .select()
    .from(scheduleActivities)
    .where(eq(scheduleActivities.projectId, projectId));

  return activities.map((activity) => ({
    id: activity.activityCode,
    name: activity.name,
    wbs: activity.wbs,
    phase: activity.phase,
    start: activity.startDate,
    end: activity.endDate,
    planned: activity.plannedProgress,
    actual: activity.actualProgress,
    linkedDocs: activity.linkedDocuments
      ? JSON.parse(activity.linkedDocuments)
      : [],
  }));
}

export async function getScheduleSyncInfo(projectId: string) {
  const syncInfo = await db
    .select()
    .from(scheduleSync)
    .where(eq(scheduleSync.projectId, projectId))
    .orderBy(scheduleSync.lastSyncAt)
    .limit(1);

  if (syncInfo.length === 0) {
    return {
      source: "Primavera P6",
      lastSync: new Date().toISOString().slice(0, 16).replace("T", " "),
      projectStart: "2026-01-01",
      projectEnd: "2026-12-31",
    };
  }

  return {
    source: syncInfo[0].source,
    lastSync: syncInfo[0].lastSyncAt
      .toISOString()
      .slice(0, 16)
      .replace("T", " "),
    projectStart: syncInfo[0].projectStart,
    projectEnd: syncInfo[0].projectEnd,
  };
}

export async function getSchedulePageData(projectId: string) {
  const [activities, syncInfo] = await Promise.all([
    getScheduleActivities(projectId),
    getScheduleSyncInfo(projectId),
  ]);

  return {
    activities,
    lastSync: syncInfo.lastSync,
    projectStart: syncInfo.projectStart,
    projectEnd: syncInfo.projectEnd,
  };
}
