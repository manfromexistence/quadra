import { eq } from "drizzle-orm";
import { db } from "@/db/client";
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

  const documents = await db
    .select()
    .from(incomingTransmittalDocuments)
    .where(eq(incomingTransmittalDocuments.transmittalId, id));

  return {
    ...transmittal[0],
    documents,
  };
}
