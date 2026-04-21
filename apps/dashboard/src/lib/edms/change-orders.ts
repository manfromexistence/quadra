import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { changeOrderDocuments, changeOrders } from "@/db/schema/change-orders";

export async function getChangeOrders(projectId: string) {
  return db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.projectId, projectId))
    .orderBy(changeOrders.createdAt);
}

export async function getChangeOrderById(id: string) {
  const changeOrder = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, id))
    .limit(1);

  if (changeOrder.length === 0) return null;

  const documents = await db
    .select()
    .from(changeOrderDocuments)
    .where(eq(changeOrderDocuments.changeOrderId, id));

  return {
    ...changeOrder[0],
    documents,
  };
}
