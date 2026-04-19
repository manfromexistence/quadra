import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { documents } from "./documents";
import { projects } from "./projects";

export const transmittals = sqliteTable("transmittals", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  transmittalNumber: text("transmittal_number").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description"),
  purpose: text("purpose").notNull().default("IFR"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  sentFrom: text("sent_from").references(() => user.id, {
    onDelete: "set null",
  }),
  sentTo: text("sent_to").notNull(),
  ccTo: text("cc_to"),
  status: text("status").notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  acknowledgedAt: integer("acknowledged_at", { mode: "timestamp" }),
  acknowledgedBy: text("acknowledged_by").references(() => user.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  customFields: text("custom_fields"),
  images: text("images"),
});

export const transmittalDocuments = sqliteTable("transmittal_documents", {
  id: text("id").primaryKey(),
  transmittalId: text("transmittal_id")
    .notNull()
    .references(() => transmittals.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  remarks: text("remarks"),
  addedAt: integer("added_at", { mode: "timestamp" }).notNull(),
});
