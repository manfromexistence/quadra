import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  dailyReportEquipment,
  dailyReportManpower,
  dailyReports,
} from "@/db/schema/daily-reports";

export async function getDailyReports(projectId: string) {
  return db
    .select()
    .from(dailyReports)
    .where(eq(dailyReports.projectId, projectId))
    .orderBy(dailyReports.reportDate);
}

export async function getDailyReportById(id: string) {
  const report = await db
    .select()
    .from(dailyReports)
    .where(eq(dailyReports.id, id))
    .limit(1);

  if (report.length === 0) return null;

  const manpower = await db
    .select()
    .from(dailyReportManpower)
    .where(eq(dailyReportManpower.dailyReportId, id));

  const equipment = await db
    .select()
    .from(dailyReportEquipment)
    .where(eq(dailyReportEquipment.dailyReportId, id));

  return {
    ...report[0],
    manpower,
    equipment,
  };
}
