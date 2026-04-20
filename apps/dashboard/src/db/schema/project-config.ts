import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Project Configuration - stores project-level settings
export const projectConfig = sqliteTable("project_config", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  projectCode: text("project_code").notNull(),
  shortCode: text("short_code").notNull(),
  client: text("client"),
  contractor: text("contractor"),
  currency: text("currency").default("usd"),
  numberingPattern: text("numbering_pattern")
    .notNull()
    .default("PRJ-DISC-TYPE-SEQ"),
  sequencePadding: integer("sequence_padding").notNull().default(4),
  separator: text("separator").notNull().default("hyphen"),
  revisionScheme: text("revision_scheme").notNull().default("alpha-numeric"),
  sequenceReset: text("sequence_reset").notNull().default("continuous"),
  defaultReviewSla: text("default_review_sla").default("10 working days"),
  reminderBeforeDue: integer("reminder_before_due").default(3),
  overdueEscalation: text("overdue_escalation").default("pm"),
  autoCloseAfter: text("auto_close_after").default("30 days of inactivity"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

// Disciplines - engineering and design disciplines
export const disciplines = sqliteTable("disciplines", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Document Types - categories of documents
export const documentTypes = sqliteTable("document_types", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Stakeholders - project parties and organizations
export const stakeholders = sqliteTable("stakeholders", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  stakeholderId: text("stakeholder_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  contact: text("contact"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Workflow Steps - approval workflow configuration
export const workflowStepTemplates = sqliteTable("workflow_step_templates", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  stepName: text("step_name").notNull(),
  actor: text("actor").notNull(),
  duration: text("duration").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
