"use server";

import { type ThemeStyles, themeStylesSchema } from "@midday/ui/theme";
import cuid from "cuid";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { z } from "zod";
import { db } from "@/db";
import { theme as themeTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const createThemeSchema = z.object({
  name: z.string().min(1).max(50),
  styles: themeStylesSchema,
});

const updateThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50).optional(),
  styles: themeStylesSchema.optional(),
});

async function getCurrentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export async function getThemes() {
  const userId = await getCurrentUserId();

  return db.select().from(themeTable).where(eq(themeTable.userId, userId));
}

export const getTheme = cache(async (themeId: string) => {
  const [theme] = await db
    .select()
    .from(themeTable)
    .where(eq(themeTable.id, themeId))
    .limit(1);

  if (!theme) {
    throw new Error("Theme not found");
  }

  return theme;
});

export async function createTheme(input: {
  name: string;
  styles: ThemeStyles;
}) {
  const userId = await getCurrentUserId();
  const parsed = createThemeSchema.parse(input);
  const now = new Date();

  const [createdTheme] = await db
    .insert(themeTable)
    .values({
      id: cuid(),
      userId,
      name: parsed.name,
      styles: parsed.styles,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return createdTheme;
}

export async function updateTheme(input: {
  id: string;
  name?: string;
  styles?: ThemeStyles;
}) {
  const userId = await getCurrentUserId();
  const parsed = updateThemeSchema.parse(input);

  if (!parsed.name && !parsed.styles) {
    throw new Error("No update payload provided");
  }

  const [updatedTheme] = await db
    .update(themeTable)
    .set({
      ...(parsed.name ? { name: parsed.name } : {}),
      ...(parsed.styles ? { styles: parsed.styles } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(themeTable.id, parsed.id), eq(themeTable.userId, userId)))
    .returning();

  if (!updatedTheme) {
    throw new Error("Theme not found");
  }

  return updatedTheme;
}

export async function deleteTheme(themeId: string) {
  const userId = await getCurrentUserId();

  const [deletedTheme] = await db
    .delete(themeTable)
    .where(and(eq(themeTable.id, themeId), eq(themeTable.userId, userId)))
    .returning();

  if (!deletedTheme) {
    throw new Error("Theme not found");
  }

  return deletedTheme;
}
