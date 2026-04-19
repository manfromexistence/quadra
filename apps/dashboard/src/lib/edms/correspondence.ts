import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  letterRelatedDocuments,
  letters,
  memos,
  minutesOfMeeting,
  momActionItems,
  momAttendees,
} from "@/db/schema/correspondence";

// Letters
export async function getLetters(projectId: string) {
  return db
    .select()
    .from(letters)
    .where(eq(letters.projectId, projectId))
    .orderBy(letters.date);
}

export async function getLetterById(id: string) {
  const letter = await db
    .select()
    .from(letters)
    .where(eq(letters.id, id))
    .limit(1);

  if (letter.length === 0) return null;

  const relatedDocs = await db
    .select()
    .from(letterRelatedDocuments)
    .where(eq(letterRelatedDocuments.letterId, id));

  return {
    ...letter[0],
    relatedDocuments: relatedDocs,
  };
}

// Memos
export async function getMemos(projectId: string) {
  return db
    .select()
    .from(memos)
    .where(eq(memos.projectId, projectId))
    .orderBy(memos.date);
}

export async function getMemoById(id: string) {
  const memo = await db.select().from(memos).where(eq(memos.id, id)).limit(1);

  return memo.length > 0 ? memo[0] : null;
}

// Minutes of Meeting
export async function getMinutesOfMeeting(projectId: string) {
  return db
    .select()
    .from(minutesOfMeeting)
    .where(eq(minutesOfMeeting.projectId, projectId))
    .orderBy(minutesOfMeeting.meetingDate);
}

export async function getMoMById(id: string) {
  const mom = await db
    .select()
    .from(minutesOfMeeting)
    .where(eq(minutesOfMeeting.id, id))
    .limit(1);

  if (mom.length === 0) return null;

  const attendees = await db
    .select()
    .from(momAttendees)
    .where(eq(momAttendees.momId, id));

  const actionItems = await db
    .select()
    .from(momActionItems)
    .where(eq(momActionItems.momId, id));

  return {
    ...mom[0],
    attendees,
    actionItems,
  };
}
