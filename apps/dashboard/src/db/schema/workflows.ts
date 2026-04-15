import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { documents } from "./documents";

export const documentWorkflows = sqliteTable("document_workflows", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  workflowName: text("workflow_name").notNull(),
  currentStep: integer("current_step").notNull().default(1),
  totalSteps: integer("total_steps").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const workflowSteps = sqliteTable("workflow_steps", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => documentWorkflows.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(),
  assignedTo: text("assigned_to")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  assignedRole: text("assigned_role"),
  status: text("status").notNull().default("pending"),
  action: text("action"),
  approvalCode: integer("approval_code"),
  comments: text("comments"),
  attachmentUrl: text("attachment_url"),
  attachmentFileName: text("attachment_file_name"),
  attachmentFileSize: integer("attachment_file_size"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  dueDate: integer("due_date", { mode: "timestamp" }),
});
