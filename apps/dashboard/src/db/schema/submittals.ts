import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { documents } from "./documents";
import { projects } from "./projects";

// Submittals - Shop drawings, material submittals, equipment submittals
export const submittals = sqliteTable("submittals", {
  id: text("id").primaryKey(),
  submittalNumber: text("submittal_number").notNull().unique(),
  type: text("type").notNull(), // shop_drawing, material, equipment
  specificationSection: text("specification_section"), // Spec section number (e.g., "01 23 00")
  revision: text("revision").notNull().default("0"),
  reviewStatus: text("review_status").notNull().default("pending"), // pending, under_review, approved, approved_with_comments, revise_and_resubmit, rejected
  dueDate: integer("due_date", { mode: "timestamp" }),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull(),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewedBy: text("reviewed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  comments: text("comments"),
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

// Submittal Documents - Junction table linking submittals to documents
export const submittalDocuments = sqliteTable("submittal_documents", {
  id: text("id").primaryKey(),
  submittalId: text("submittal_id")
    .notNull()
    .references(() => submittals.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  revision: text("revision").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const submittalsRelations = relations(submittals, ({ one, many }) => ({
  project: one(projects, {
    fields: [submittals.projectId],
    references: [projects.id],
  }),
  submittedByUser: one(user, {
    fields: [submittals.submittedBy],
    references: [user.id],
  }),
  reviewedByUser: one(user, {
    fields: [submittals.reviewedBy],
    references: [user.id],
  }),
  documents: many(submittalDocuments),
}));

export const submittalDocumentsRelations = relations(
  submittalDocuments,
  ({ one }) => ({
    submittal: one(submittals, {
      fields: [submittalDocuments.submittalId],
      references: [submittals.id],
    }),
    document: one(documents, {
      fields: [submittalDocuments.documentId],
      references: [documents.id],
    }),
  }),
);
