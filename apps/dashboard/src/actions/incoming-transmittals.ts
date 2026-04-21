"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  incomingTransmittalDocuments,
  incomingTransmittals,
} from "@/db/schema/incoming-transmittals";
import { logEdmsActivity } from "@/lib/edms/notifications";
import {
  actionFromError,
  actionOk,
  createEdmsId,
  normalizeOptionalString,
  parseOptionalDate,
  requireActionSessionUser,
} from "./_edms";

interface CreateIncomingTransmittalInput {
  transmittalNumber: string;
  date: string;
  receivedDate: string;
  from: string;
  fromOrg: string;
  subject: string;
  purpose: "IFR" | "IFA" | "IFC" | "IFI";
  theirRef?: string;
  responseRequired?: boolean;
  responseDue?: string;
  priority: "High" | "Medium" | "Low";
  notes?: string;
  projectId: string;
}

interface AddIncomingTransmittalDocumentInput {
  transmittalId: string;
  documentCode: string;
  title: string;
  revision: string;
  status: string;
  ourAction?: string;
}

export async function createIncomingTransmittal(
  input: CreateIncomingTransmittalInput,
) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();
    const transmittalId = createEdmsId("in-tx");

    await db.insert(incomingTransmittals).values({
      id: transmittalId,
      transmittalNumber: input.transmittalNumber,
      date: new Date(input.date),
      receivedDate: new Date(input.receivedDate),
      from: input.from,
      fromOrg: input.fromOrg,
      subject: input.subject,
      purpose: input.purpose,
      theirRef: normalizeOptionalString(input.theirRef),
      responseRequired: input.responseRequired ?? false,
      responseDue: parseOptionalDate(input.responseDue),
      responseStatus: input.responseRequired
        ? "Pending"
        : "No Response Required",
      priority: input.priority,
      notes: normalizeOptionalString(input.notes),
      attachments: 0,
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "incoming_transmittal_created",
      entityType: "incoming_transmittal",
      entityId: transmittalId,
      entityName: input.subject,
      description: `Registered incoming transmittal ${input.transmittalNumber}`,
    });

    revalidatePath("/incoming-transmittals");
    revalidatePath("/projects");

    return actionOk({ id: transmittalId });
  } catch (error) {
    return actionFromError(error, "Unable to register incoming transmittal.");
  }
}

export async function addIncomingTransmittalDocument(
  input: AddIncomingTransmittalDocumentInput,
) {
  try {
    const _sessionUser = await requireActionSessionUser();

    await db.insert(incomingTransmittalDocuments).values({
      id: createEdmsId("in-tx-doc"),
      transmittalId: input.transmittalId,
      documentCode: input.documentCode,
      title: input.title,
      revision: input.revision,
      status: input.status,
      ourAction: normalizeOptionalString(input.ourAction),
      createdAt: new Date(),
    });

    // Update attachment count
    const [transmittal] = await db
      .select({ attachments: incomingTransmittals.attachments })
      .from(incomingTransmittals)
      .where(eq(incomingTransmittals.id, input.transmittalId))
      .limit(1);

    if (transmittal) {
      await db
        .update(incomingTransmittals)
        .set({
          attachments: (transmittal.attachments || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(incomingTransmittals.id, input.transmittalId));
    }

    revalidatePath("/incoming-transmittals");

    return actionOk({ success: true });
  } catch (error) {
    return actionFromError(error, "Unable to add document to transmittal.");
  }
}

export async function updateIncomingTransmittal(
  id: string,
  updates: Partial<{
    responseStatus: string;
    responseBy: string;
    responseDate: string;
    notes: string;
  }>,
) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();

    await db
      .update(incomingTransmittals)
      .set({
        ...updates,
        responseDate: updates.responseDate
          ? new Date(updates.responseDate)
          : undefined,
        updatedAt: now,
      })
      .where(eq(incomingTransmittals.id, id));

    const [transmittal] = await db
      .select({ subject: incomingTransmittals.subject })
      .from(incomingTransmittals)
      .where(eq(incomingTransmittals.id, id))
      .limit(1);

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: "",
      action: "incoming_transmittal_updated",
      entityType: "incoming_transmittal",
      entityId: id,
      entityName: transmittal?.subject,
      description: "Updated incoming transmittal",
    });

    revalidatePath("/incoming-transmittals");

    return actionOk({ id });
  } catch (error) {
    return actionFromError(error, "Unable to update incoming transmittal.");
  }
}
