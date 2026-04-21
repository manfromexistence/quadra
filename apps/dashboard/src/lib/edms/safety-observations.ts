import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { safetyObservations } from "@/db/schema/safety-observations";

export async function getSafetyObservations(projectId: string) {
  return db
    .select()
    .from(safetyObservations)
    .where(eq(safetyObservations.projectId, projectId))
    .orderBy(safetyObservations.createdAt);
}

export async function getSafetyObservationById(id: string) {
  const observation = await db
    .select()
    .from(safetyObservations)
    .where(eq(safetyObservations.id, id))
    .limit(1);

  return observation.length > 0 ? observation[0] : null;
}
