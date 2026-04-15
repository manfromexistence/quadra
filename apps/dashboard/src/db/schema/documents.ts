import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  documentNumber: text("document_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  discipline: text("discipline"),
  category: text("category"),
  version: text("version").notNull().default("1.0"),
  revision: text("revision"),
  isLatestVersion: integer("is_latest_version", { mode: "boolean" })
    .notNull()
    .default(true),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  fileUrl: text("file_url").notNull(),
  status: text("status").notNull().default("draft"),
  tags: text("tags"),
  customFields: text("custom_fields"),
  images: text("images"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id, {
    onDelete: "set null",
  }),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  approvedBy: text("approved_by").references(() => user.id, {
    onDelete: "set null",
  }),
  rejectedAt: integer("rejected_at", { mode: "timestamp" }),
  rejectedBy: text("rejected_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const documentVersions = sqliteTable("document_versions", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  changeDescription: text("change_description"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const documentComments = sqliteTable("document_comments", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  commentType: text("comment_type").notNull().default("general"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
