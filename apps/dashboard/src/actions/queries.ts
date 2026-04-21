"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  queryLinkedDocuments,
  rfis,
  siteTechQueries,
  technicalQueries,
} from "@/db/schema/queries";
import { logEdmsActivity } from "@/lib/edms/notifications";
import {
  actionFromError,
  actionOk,
  createEdmsId,
  normalizeOptionalString,
  parseOptionalDate,
  requireActionSessionUser,
} from "./_edms";

interface CreateTechnicalQueryInput {
  queryNumber: string;
  date: string;
  discipline: string;
  subject: string;
  description: string;
  status: "Open" | "Responded" | "Closed";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  dueDate?: string;
  projectId: string;
}

interface CreateSiteTechQueryInput {
  queryNumber: string;
  date: string;
  discipline: string;
  subject: string;
  description: string;
  location?: string;
  status: "Open" | "Responded" | "Closed";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  dueDate?: string;
  projectId: string;
}

interface CreateRFIInput {
  rfiNumber: string;
  date: string;
  raisedBy: string;
  from: string;
  subject: string;
  description: string;
  category: string;
  status: "Under Review" | "Responded" | "Closed";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  dueDate?: string;
  projectId: string;
}

export async function createTechnicalQuery(input: CreateTechnicalQueryInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();
    const queryId = createEdmsId("tq");

    await db.insert(technicalQueries).values({
      id: queryId,
      queryNumber: input.queryNumber,
      date: new Date(input.date),
      raisedBy: sessionUser.id,
      discipline: input.discipline,
      subject: input.subject,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assignedTo: input.assignedTo,
      dueDate: parseOptionalDate(input.dueDate),
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "tq_created",
      entityType: "technical_query",
      entityId: queryId,
      entityName: input.subject,
      description: `Created technical query ${input.queryNumber}`,
    });

    revalidatePath("/technical-queries");
    revalidatePath("/projects");

    return actionOk({ id: queryId });
  } catch (error) {
    return actionFromError(error, "Unable to create technical query.");
  }
}

export async function createSiteTechQuery(input: CreateSiteTechQueryInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();
    const queryId = createEdmsId("stq");

    await db.insert(siteTechQueries).values({
      id: queryId,
      queryNumber: input.queryNumber,
      date: new Date(input.date),
      raisedBy: "Site Team",
      discipline: input.discipline,
      subject: input.subject,
      description: input.description,
      location: normalizeOptionalString(input.location),
      status: input.status,
      priority: input.priority,
      assignedTo: input.assignedTo,
      dueDate: parseOptionalDate(input.dueDate),
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "stq_created",
      entityType: "site_tech_query",
      entityId: queryId,
      entityName: input.subject,
      description: `Created site technical query ${input.queryNumber}`,
    });

    revalidatePath("/site-tech-queries");
    revalidatePath("/projects");

    return actionOk({ id: queryId });
  } catch (error) {
    return actionFromError(error, "Unable to create site technical query.");
  }
}

export async function createRFI(input: CreateRFIInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();
    const rfiId = createEdmsId("rfi");

    await db.insert(rfis).values({
      id: rfiId,
      rfiNumber: input.rfiNumber,
      date: new Date(input.date),
      raisedBy: input.raisedBy,
      from: input.from,
      subject: input.subject,
      description: input.description,
      category: input.category,
      status: input.status,
      priority: input.priority,
      assignedTo: input.assignedTo,
      dueDate: parseOptionalDate(input.dueDate),
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "rfi_created",
      entityType: "rfi",
      entityId: rfiId,
      entityName: input.subject,
      description: `Created RFI ${input.rfiNumber}`,
    });

    revalidatePath("/rfis");
    revalidatePath("/projects");

    return actionOk({ id: rfiId });
  } catch (error) {
    return actionFromError(error, "Unable to create RFI.");
  }
}

export async function updateTechnicalQuery(
  id: string,
  updates: Partial<{
    status: "Open" | "Responded" | "Closed";
    priority: "High" | "Medium" | "Low";
    assignedTo: string;
    dueDate: string;
    response: string;
    responseDate: string;
  }>,
) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();

    await db
      .update(technicalQueries)
      .set({
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        responseDate: updates.responseDate
          ? new Date(updates.responseDate)
          : undefined,
        updatedAt: now,
      })
      .where(eq(technicalQueries.id, id));

    const [query] = await db
      .select({ subject: technicalQueries.subject })
      .from(technicalQueries)
      .where(eq(technicalQueries.id, id))
      .limit(1);

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: "", // Would need to fetch from query
      action: "tq_updated",
      entityType: "technical_query",
      entityId: id,
      entityName: query?.subject,
      description: "Updated technical query",
    });

    revalidatePath("/technical-queries");

    return actionOk({ id });
  } catch (error) {
    return actionFromError(error, "Unable to update technical query.");
  }
}

export async function linkDocumentToQuery(
  queryId: string,
  queryType: "TQ" | "STQ" | "RFI",
  documentCode: string,
) {
  try {
    const _sessionUser = await requireActionSessionUser();

    await db.insert(queryLinkedDocuments).values({
      id: createEdmsId("query-doc"),
      queryId,
      queryType,
      documentCode,
      createdAt: new Date(),
    });

    revalidatePath("/technical-queries");
    revalidatePath("/site-tech-queries");
    revalidatePath("/rfis");

    return actionOk({ success: true });
  } catch (error) {
    return actionFromError(error, "Unable to link document to query.");
  }
}
