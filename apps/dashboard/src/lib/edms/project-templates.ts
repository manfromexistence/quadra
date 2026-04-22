import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { projectTemplates } from "@/db/schema/project-templates";

export async function getProjectTemplates(projectId?: string) {
  try {
    return await db
      .select()
      .from(projectTemplates)
      .where(
        projectId
          ? eq(projectTemplates.projectId, projectId)
          : eq(projectTemplates.isGlobal, true),
      )
      .orderBy(projectTemplates.createdAt);
  } catch (error) {
    console.error("Error fetching project templates:", error);
    return [];
  }
}

export async function getProjectTemplateById(id: string) {
  const template = await db
    .select()
    .from(projectTemplates)
    .where(eq(projectTemplates.id, id))
    .limit(1);

  if (template.length === 0) return null;

  return template[0];
}

export async function createProjectTemplate(data: {
  name: string;
  type: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  projectId?: string;
  isGlobal?: boolean;
}) {
  const [template] = await db
    .insert(projectTemplates)
    .values({
      id: crypto.randomUUID(),
      ...data,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return template;
}

export async function incrementTemplateDownloadCount(id: string) {
  await db
    .update(projectTemplates)
    .set({
      downloadCount: sql`download_count + 1`,
    })
    .where(eq(projectTemplates.id, id));
}
