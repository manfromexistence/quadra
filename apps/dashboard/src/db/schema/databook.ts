import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";

export const databookSections = sqliteTable("databook_sections", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  title: text("title").notNull(),
  requiredCount: integer("required_count").notNull().default(0),
  collectedCount: integer("collected_count").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const databookDocuments = sqliteTable("databook_documents", {
  id: text("id").primaryKey(),
  sectionId: text("section_id")
    .notNull()
    .references(() => databookSections.id, { onDelete: "cascade" }),
  documentCode: text("document_code").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("missing"), // collected, pending, missing
  format: text("format").default("PDF"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const databookRules = sqliteTable("databook_rules", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  pattern: text("pattern").notNull(), // e.g., "*-CIV-DWG-*"
  sectionId: text("section_id")
    .notNull()
    .references(() => databookSections.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull(), // On approval, On upload, etc.
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const databookMetadata = sqliteTable("databook_metadata", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  revision: text("revision").notNull(),
  compiler: text("compiler").notNull(),
  targetDate: text("target_date").notNull(), // YYYY-MM-DD
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
