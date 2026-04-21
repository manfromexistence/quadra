import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { documents } from "./documents";
import { projects } from "./projects";

// Inspection Requests
export const inspectionRequests = sqliteTable("inspection_requests", {
  id: text("id").primaryKey(),
  inspectionNumber: text("inspection_number").notNull().unique(),
  type: text("type").notNull(), // concrete_pour, structural_steel, mep, fire_protection, etc.
  location: text("location").notNull(),
  scheduledDate: integer("scheduled_date", { mode: "timestamp" }).notNull(),
  inspector: text("inspector"),
  results: text("results").notNull(), // pass, fail, conditional
  deficiencies: text("deficiencies"),
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

// Inspection Request Documents - Junction table linking inspections to documents
export const inspectionRequestDocuments = sqliteTable(
  "inspection_request_documents",
  {
    id: text("id").primaryKey(),
    inspectionRequestId: text("inspection_request_id")
      .notNull()
      .references(() => inspectionRequests.id, { onDelete: "cascade" }),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
);

// Relations
export const inspectionRequestsRelations = relations(
  inspectionRequests,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [inspectionRequests.projectId],
      references: [projects.id],
    }),
    documents: many(inspectionRequestDocuments),
  }),
);

export const inspectionRequestDocumentsRelations = relations(
  inspectionRequestDocuments,
  ({ one }) => ({
    inspectionRequest: one(inspectionRequests, {
      fields: [inspectionRequestDocuments.inspectionRequestId],
      references: [inspectionRequests.id],
    }),
    document: one(documents, {
      fields: [inspectionRequestDocuments.documentId],
      references: [documents.id],
    }),
  }),
);
