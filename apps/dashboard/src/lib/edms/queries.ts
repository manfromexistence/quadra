import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  queryLinkedDocuments,
  rfis,
  siteTechQueries,
  technicalQueries,
} from "@/db/schema/queries";

// Technical Queries
export async function getTechnicalQueries(projectId: string) {
  return db
    .select()
    .from(technicalQueries)
    .where(eq(technicalQueries.projectId, projectId))
    .orderBy(technicalQueries.date);
}

export async function getTechnicalQueryById(id: string) {
  const query = await db
    .select()
    .from(technicalQueries)
    .where(eq(technicalQueries.id, id))
    .limit(1);

  if (query.length === 0) return null;

  const linkedDocs = await db
    .select()
    .from(queryLinkedDocuments)
    .where(eq(queryLinkedDocuments.queryId, id));

  return {
    ...query[0],
    linkedDocuments: linkedDocs,
  };
}

// Site Technical Queries
export async function getSiteTechQueries(projectId: string) {
  return db
    .select()
    .from(siteTechQueries)
    .where(eq(siteTechQueries.projectId, projectId))
    .orderBy(siteTechQueries.date);
}

export async function getSiteTechQueryById(id: string) {
  const query = await db
    .select()
    .from(siteTechQueries)
    .where(eq(siteTechQueries.id, id))
    .limit(1);

  if (query.length === 0) return null;

  const linkedDocs = await db
    .select()
    .from(queryLinkedDocuments)
    .where(eq(queryLinkedDocuments.queryId, id));

  return {
    ...query[0],
    linkedDocuments: linkedDocs,
  };
}

// RFIs
export async function getRFIs(projectId: string) {
  return db
    .select()
    .from(rfis)
    .where(eq(rfis.projectId, projectId))
    .orderBy(rfis.date);
}

export async function getRFIById(id: string) {
  const rfi = await db.select().from(rfis).where(eq(rfis.id, id)).limit(1);

  if (rfi.length === 0) return null;

  const linkedDocs = await db
    .select()
    .from(queryLinkedDocuments)
    .where(eq(queryLinkedDocuments.queryId, id));

  return {
    ...rfi[0],
    linkedDocuments: linkedDocs,
  };
}
