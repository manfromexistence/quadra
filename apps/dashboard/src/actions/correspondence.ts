"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  letterRelatedDocuments,
  letters,
  memos,
} from "@/db/schema/correspondence";
import { logEdmsActivity } from "@/lib/edms/notifications";
import {
  actionFromError,
  actionOk,
  createEdmsId,
  normalizeOptionalString,
  parseOptionalDate,
  requireActionSessionUser,
} from "./_edms";

interface CreateLetterInput {
  letterNumber: string;
  date: string;
  direction: "Outgoing" | "Incoming";
  from: string;
  to: string;
  toType: string;
  subject: string;
  category: string;
  ref?: string;
  forInfo?: boolean;
  actionRequired?: boolean;
  responseRequired?: "Y" | "N";
  projectId: string;
}

interface CreateMemoInput {
  memoNumber: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  category: string;
  content: string;
  urgent?: boolean;
  projectId: string;
}

export async function createLetter(input: CreateLetterInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();
    const letterId = createEdmsId("letter");

    await db.insert(letters).values({
      id: letterId,
      letterNumber: input.letterNumber,
      date: new Date(input.date),
      direction: input.direction,
      from: input.from,
      to: input.to,
      toType: input.toType,
      subject: input.subject,
      category: input.category,
      ref: normalizeOptionalString(input.ref),
      author: sessionUser.id,
      status: input.direction === "Outgoing" ? "Sent" : "Received",
      urgent: false,
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "letter_created",
      entityType: "letter",
      entityId: letterId,
      entityName: input.subject,
      description: `Created letter ${input.letterNumber} (${input.direction})`,
    });

    revalidatePath("/letters");
    revalidatePath("/projects");

    return actionOk({ id: letterId });
  } catch (error) {
    return actionFromError(error, "Unable to create letter.");
  }
}

export async function createMemo(input: CreateMemoInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();
    const memoId = createEdmsId("memo");

    await db.insert(memos).values({
      id: memoId,
      memoNumber: input.memoNumber,
      date: new Date(input.date),
      from: input.from,
      to: input.to,
      subject: input.subject,
      category: input.category,
      content: input.content,
      urgent: input.urgent ?? false,
      status: "Distributed",
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "memo_created",
      entityType: "memo",
      entityId: memoId,
      entityName: input.subject,
      description: `Created memo ${input.memoNumber}`,
    });

    revalidatePath("/memos");
    revalidatePath("/projects");

    return actionOk({ id: memoId });
  } catch (error) {
    return actionFromError(error, "Unable to create memo.");
  }
}

export async function updateLetter(
  id: string,
  updates: Partial<{
    status: string;
    urgent: boolean;
    forInfo: boolean;
    actionRequired: boolean;
    responseRequired: "Y" | "N";
  }>,
) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();

    await db
      .update(letters)
      .set({
        ...updates,
        updatedAt: now,
      })
      .where(eq(letters.id, id));

    const [letter] = await db
      .select({ subject: letters.subject })
      .from(letters)
      .where(eq(letters.id, id))
      .limit(1);

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: "",
      action: "letter_updated",
      entityType: "letter",
      entityId: id,
      entityName: letter?.subject,
      description: "Updated letter",
    });

    revalidatePath("/letters");

    return actionOk({ id });
  } catch (error) {
    return actionFromError(error, "Unable to update letter.");
  }
}

export async function linkDocumentToLetter(
  letterId: string,
  documentCode: string,
) {
  try {
    const sessionUser = await requireActionSessionUser();

    await db.insert(letterRelatedDocuments).values({
      id: createEdmsId("letter-doc"),
      letterId,
      documentCode,
      createdAt: new Date(),
    });

    revalidatePath("/letters");

    return actionOk({ success: true });
  } catch (error) {
    return actionFromError(error, "Unable to link document to letter.");
  }
}
