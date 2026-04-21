import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  commissioningChecklistItems,
  commissioningChecklists,
} from "@/db/schema/commissioning";

export async function getCommissioningChecklists(projectId: string) {
  return db
    .select()
    .from(commissioningChecklists)
    .where(eq(commissioningChecklists.projectId, projectId))
    .orderBy(commissioningChecklists.createdAt);
}

export async function getCommissioningChecklistById(id: string) {
  const checklist = await db
    .select()
    .from(commissioningChecklists)
    .where(eq(commissioningChecklists.id, id))
    .limit(1);

  if (checklist.length === 0) return null;

  const items = await db
    .select()
    .from(commissioningChecklistItems)
    .where(eq(commissioningChecklistItems.checklistId, id))
    .orderBy(commissioningChecklistItems.itemNumber);

  return {
    ...checklist[0],
    items,
  };
}
