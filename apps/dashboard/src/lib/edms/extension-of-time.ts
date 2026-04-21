import { eq } from "drizzle-orm";
import { db } from "@/db";
import { extensionOfTimeRequests } from "@/db/schema/extension-of-time";

export async function getExtensionOfTimeRequests(projectId: string) {
  return db
    .select()
    .from(extensionOfTimeRequests)
    .where(eq(extensionOfTimeRequests.projectId, projectId))
    .orderBy(extensionOfTimeRequests.createdAt);
}

export async function getExtensionOfTimeRequestById(id: string) {
  const eot = await db
    .select()
    .from(extensionOfTimeRequests)
    .where(eq(extensionOfTimeRequests.id, id))
    .limit(1);

  return eot.length > 0 ? eot[0] : null;
}
