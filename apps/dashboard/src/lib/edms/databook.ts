import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  databookDocuments,
  databookMetadata,
  databookRules,
  databookSections,
} from "@/db/schema/databook";

export async function getDatabookSections(projectId: string) {
  const sections = await db
    .select()
    .from(databookSections)
    .where(eq(databookSections.projectId, projectId))
    .orderBy(databookSections.sortOrder);

  const sectionsWithDocs = await Promise.all(
    sections.map(async (section) => {
      const docs = await db
        .select()
        .from(databookDocuments)
        .where(eq(databookDocuments.sectionId, section.id));

      return {
        code: section.code,
        title: section.title,
        required: section.requiredCount,
        collected: section.collectedCount,
        docs: docs.map((doc) => ({
          code: doc.documentCode,
          title: doc.title,
          status: doc.status,
          format: doc.format || "PDF",
        })),
      };
    }),
  );

  return sectionsWithDocs;
}

export async function getDatabookRules(projectId: string) {
  const rules = await db
    .select({
      pattern: databookRules.pattern,
      sectionCode: databookSections.code,
      sectionTitle: databookSections.title,
      trigger: databookRules.trigger,
    })
    .from(databookRules)
    .innerJoin(
      databookSections,
      eq(databookRules.sectionId, databookSections.id),
    )
    .where(eq(databookRules.projectId, projectId));

  return rules.map((rule) => ({
    pattern: rule.pattern,
    section: `${rule.sectionCode} ${rule.sectionTitle}`,
    trigger: rule.trigger,
  }));
}

export async function getDatabookMetadata(projectId: string) {
  const metadata = await db
    .select()
    .from(databookMetadata)
    .where(eq(databookMetadata.projectId, projectId))
    .limit(1);

  if (metadata.length === 0) {
    return {
      title: "Project Data Book",
      revision: "Rev 00",
      compiler: "Document Controller",
      targetDate: new Date().toISOString().split("T")[0],
    };
  }

  return {
    title: metadata[0].title,
    revision: metadata[0].revision,
    compiler: metadata[0].compiler,
    targetDate: metadata[0].targetDate,
  };
}

export async function getDatabookPageData(projectId: string) {
  const [sections, rules, metadata] = await Promise.all([
    getDatabookSections(projectId),
    getDatabookRules(projectId),
    getDatabookMetadata(projectId),
  ]);

  return {
    sections,
    rules,
    metadata,
  };
}
