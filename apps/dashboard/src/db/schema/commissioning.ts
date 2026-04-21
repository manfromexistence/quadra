import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { documents } from "./documents";
import { projects } from "./projects";

// Commissioning Checklists
export const commissioningChecklists = sqliteTable("commissioning_checklists", {
  id: text("id").primaryKey(),
  checklistNumber: text("checklist_number").notNull().unique(),
  system: text("system").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  completedBy: text("completed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Commissioning Checklist Items
export const commissioningChecklistItems = sqliteTable(
  "commissioning_checklist_items",
  {
    id: text("id").primaryKey(),
    checklistId: text("checklist_id")
      .notNull()
      .references(() => commissioningChecklists.id, { onDelete: "cascade" }),
    itemNumber: text("item_number").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("pending"), // pending, passed, failed, na
    comments: text("comments"),
    documentId: text("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
  },
);

// Relations
export const commissioningChecklistsRelations = relations(
  commissioningChecklists,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [commissioningChecklists.projectId],
      references: [projects.id],
    }),
    completedByUser: one(user, {
      fields: [commissioningChecklists.completedBy],
      references: [user.id],
    }),
    items: many(commissioningChecklistItems),
  }),
);

export const commissioningChecklistItemsRelations = relations(
  commissioningChecklistItems,
  ({ one }) => ({
    checklist: one(commissioningChecklists, {
      fields: [commissioningChecklistItems.checklistId],
      references: [commissioningChecklists.id],
    }),
    document: one(documents, {
      fields: [commissioningChecklistItems.documentId],
      references: [documents.id],
    }),
  }),
);
