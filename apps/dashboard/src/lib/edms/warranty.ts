import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { warrantyDocuments, warrantyRecords } from "@/db/schema/warranty";

export async function getWarrantyRecords(projectId: string) {
  return db
    .select()
    .from(warrantyRecords)
    .where(eq(warrantyRecords.projectId, projectId))
    .orderBy(warrantyRecords.startDate);
}

export async function getWarrantyRecordById(id: string) {
  const warranty = await db
    .select()
    .from(warrantyRecords)
    .where(eq(warrantyRecords.id, id))
    .limit(1);

  if (warranty.length === 0) return null;

  const documents = await db
    .select()
    .from(warrantyDocuments)
    .where(eq(warrantyDocuments.warrantyId, id));

  return {
    ...warranty[0],
    documents,
  };
}
