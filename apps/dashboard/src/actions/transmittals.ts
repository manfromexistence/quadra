"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { transmittalDocuments, transmittals } from "@/db/schema";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

interface CreateTransmittalData {
  transmittalNumber: string;
  date: string;
  projectId: string;
  recipientId: string;
  purpose: string;
  subject: string;
  dueDate: string;
  remarks: string;
  selectedDocuments: string[];
}

export async function createTransmittal(data: CreateTransmittalData) {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (!canManageEdmsContent(sessionUser.role)) {
    throw new Error("Unauthorized");
  }

  try {
    // Create transmittal
    const [transmittal] = await db
      .insert(transmittals)
      .values({
        transmittalNumber: data.transmittalNumber,
        projectId: data.projectId,
        recipientId: data.recipientId,
        subject: data.subject,
        purpose: data.purpose,
        status: "draft",
        sentDate: new Date(data.date),
        dueDate: new Date(data.dueDate),
        remarks: data.remarks || null,
        createdBy: sessionUser.id,
      })
      .returning();

    // Link documents to transmittal
    if (data.selectedDocuments.length > 0) {
      await db.insert(transmittalDocuments).values(
        data.selectedDocuments.map((documentId) => ({
          transmittalId: transmittal.id,
          documentId,
        })),
      );
    }

    revalidatePath("/transmittals");
    redirect(`/transmittals/${transmittal.id}`);
  } catch (error) {
    console.error("Failed to create transmittal:", error);
    throw new Error("Failed to create transmittal");
  }
}
