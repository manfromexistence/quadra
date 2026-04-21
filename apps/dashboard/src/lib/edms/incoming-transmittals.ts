import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import {
  incomingTransmittalDocuments,
  incomingTransmittals,
} from "@/db/schema/incoming-transmittals";

export async function getIncomingTransmittals(projectId: string) {
  return db
    .select()
    .from(incomingTransmittals)
    .where(eq(incomingTransmittals.projectId, projectId))
    .orderBy(incomingTransmittals.receivedDate);
}

export async function getIncomingTransmittalById(id: string) {
  const transmittal = await db
    .select()
    .from(incomingTransmittals)
    .where(eq(incomingTransmittals.id, id))
    .limit(1);

  if (transmittal.length === 0) return null;

  const transmittalDocs = await db
    .select({
      id: incomingTransmittalDocuments.id,
      documentId: incomingTransmittalDocuments.documentId,
      revision: incomingTransmittalDocuments.revision,
      status: incomingTransmittalDocuments.status,
      ourAction: incomingTransmittalDocuments.ourAction,
      documentNumber: documents.documentNumber,
      title: documents.title,
      discipline: documents.discipline,
    })
    .from(incomingTransmittalDocuments)
    .innerJoin(
      documents,
      eq(incomingTransmittalDocuments.documentId, documents.id),
    )
    .where(eq(incomingTransmittalDocuments.transmittalId, id));

  return {
    ...transmittal[0],
    documents: transmittalDocs,
  };
}
