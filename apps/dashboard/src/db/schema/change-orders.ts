import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { documents } from "./documents";
import { projects } from "./projects";

// Change Orders / Variations
export const changeOrders = sqliteTable("change_orders", {
  id: text("id").primaryKey(),
  changeOrderNumber: text("change_order_number").notNull().unique(),
  originalContractValue: integer("original_contract_value"), // In cents/minor units
  changeValue: integer("change_value").notNull(), // In cents/minor units
  reason: text("reason").notNull(),
  approvalStatus: text("approval_status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: text("approved_by").references(() => user.id, {
    onDelete: "set null",
  }),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
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

// Change Order Documents - Junction table linking change orders to documents
export const changeOrderDocuments = sqliteTable("change_order_documents", {
  id: text("id").primaryKey(),
  changeOrderId: text("change_order_id")
    .notNull()
    .references(() => changeOrders.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const changeOrdersRelations = relations(
  changeOrders,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [changeOrders.projectId],
      references: [projects.id],
    }),
    approvedByUser: one(user, {
      fields: [changeOrders.approvedBy],
      references: [user.id],
    }),
    documents: many(changeOrderDocuments),
  }),
);

export const changeOrderDocumentsRelations = relations(
  changeOrderDocuments,
  ({ one }) => ({
    changeOrder: one(changeOrders, {
      fields: [changeOrderDocuments.changeOrderId],
      references: [changeOrders.id],
    }),
    document: one(documents, {
      fields: [changeOrderDocuments.documentId],
      references: [documents.id],
    }),
  }),
);
