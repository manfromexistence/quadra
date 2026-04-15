import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user as users } from "../schema";
import { documents } from "./documents";

/**
 * Document workflows - tracks the review and approval process
 */
export const documentWorkflows = pgTable("document_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  workflowName: varchar("workflow_name", { length: 255 }).notNull(),
  currentStep: integer("current_step").notNull().default(1),
  totalSteps: integer("total_steps").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // pending, in_progress, approved, rejected, cancelled
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
});

/**
 * Workflow steps - individual review/approval steps
 */
export const workflowSteps = pgTable("workflow_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => documentWorkflows.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  stepName: varchar("step_name", { length: 255 }).notNull(),
  assignedTo: text("assigned_to")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignedRole: varchar("assigned_role", { length: 50 }), // pmc, client, etc.
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // pending, in_progress, approved, approved_with_comments, rejected, skipped, for_information
  action: varchar("action", { length: 50 }), // approve, approve_with_comments, reject, comment, for_information
  approvalCode: integer("approval_code"), // 1=Approved, 2=Approved with Comments, 3=Rejected, 4=For Information Only
  comments: text("comments"),
  attachmentUrl: text("attachment_url"), // URL to CSR or other attachment files
  attachmentFileName: varchar("attachment_file_name", { length: 500 }),
  attachmentFileSize: integer("attachment_file_size"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
});

// Relations
export const documentWorkflowsRelations = relations(documentWorkflows, ({ one, many }) => ({
  document: one(documents, {
    fields: [documentWorkflows.documentId],
    references: [documents.id],
  }),
  createdByUser: one(users, {
    fields: [documentWorkflows.createdBy],
    references: [users.id],
  }),
  steps: many(workflowSteps),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(documentWorkflows, {
    fields: [workflowSteps.workflowId],
    references: [documentWorkflows.id],
  }),
  assignedToUser: one(users, {
    fields: [workflowSteps.assignedTo],
    references: [users.id],
  }),
}));
