import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { documents } from "./documents";
import { projects } from "./projects";

// Warranty Records
export const warrantyRecords = sqliteTable("warranty_records", {
  id: text("id").primaryKey(),
  warrantyNumber: text("warranty_number").notNull().unique(),
  item: text("item").notNull(),
  description: text("description").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  warrantyType: text("warranty_type").notNull(), // manufacturer, contractor, system
  status: text("status").notNull().default("active"), // active, expired, claimed
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Warranty Documents - Junction table linking warranties to documents
export const warrantyDocuments = sqliteTable("warranty_documents", {
  id: text("id").primaryKey(),
  warrantyId: text("warranty_id")
    .notNull()
    .references(() => warrantyRecords.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const warrantyRecordsRelations = relations(
  warrantyRecords,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [warrantyRecords.projectId],
      references: [projects.id],
    }),
    documents: many(warrantyDocuments),
  }),
);

export const warrantyDocumentsRelations = relations(
  warrantyDocuments,
  ({ one }) => ({
    warranty: one(warrantyRecords, {
      fields: [warrantyDocuments.warrantyId],
      references: [warrantyRecords.id],
    }),
    document: one(documents, {
      fields: [warrantyDocuments.documentId],
      references: [documents.id],
    }),
  }),
);
