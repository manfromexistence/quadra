import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  inspectionRequestDocuments,
  inspectionRequests,
} from "@/db/schema/inspections";

export async function getInspections(projectId: string) {
  return db
    .select()
    .from(inspectionRequests)
    .where(eq(inspectionRequests.projectId, projectId))
    .orderBy(inspectionRequests.scheduledDate);
}

export async function getInspectionById(id: string) {
  const inspection = await db
    .select()
    .from(inspectionRequests)
    .where(eq(inspectionRequests.id, id))
    .limit(1);

  if (inspection.length === 0) return null;

  const documents = await db
    .select()
    .from(inspectionRequestDocuments)
    .where(eq(inspectionRequestDocuments.inspectionRequestId, id));

  return {
    ...inspection[0],
    documents,
  };
}
