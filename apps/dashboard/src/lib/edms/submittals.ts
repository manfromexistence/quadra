import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { submittalDocuments, submittals } from "@/db/schema/submittals";

export async function getSubmittals(projectId: string) {
  return db
    .select()
    .from(submittals)
    .where(eq(submittals.projectId, projectId))
    .orderBy(submittals.submittedAt);
}

export async function getSubmittalById(id: string) {
  const submittal = await db
    .select()
    .from(submittals)
    .where(eq(submittals.id, id))
    .limit(1);

  if (submittal.length === 0) return null;

  const submittalDocs = await db
    .select({
      id: submittalDocuments.id,
      documentId: submittalDocuments.documentId,
      revision: submittalDocuments.revision,
      documentNumber: documents.documentNumber,
      title: documents.title,
      discipline: documents.discipline,
    })
    .from(submittalDocuments)
    .innerJoin(documents, eq(submittalDocuments.documentId, documents.id))
    .where(eq(submittalDocuments.submittalId, id));

  return {
    ...submittal[0],
    documents: submittalDocs,
  };
}
