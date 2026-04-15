import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user as users } from "../schema";
import { projects } from "./projects";

/**
 * Documents table - stores all project documents with metadata
 */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  // Document identification
  documentNumber: varchar("document_number", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),

  // Document classification
  discipline: varchar("discipline", { length: 100 }), // Civil, Structural, MEP, Architectural, etc.
  category: varchar("category", { length: 100 }), // Drawing, Specification, Report, etc.

  // Version control
  version: varchar("version", { length: 50 }).notNull().default("1.0"),
  revision: varchar("revision", { length: 50 }),
  isLatestVersion: varchar("is_latest_version", { length: 10 }).notNull().default("true"),

  // File information
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileSize: integer("file_size"), // in bytes
  fileType: varchar("file_type", { length: 50 }), // pdf, docx, xlsx, dwg, etc.
  fileUrl: text("file_url").notNull(),

  // Status tracking
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  // draft, submitted, under_review, approved, rejected, superseded

  // Metadata
  tags: text("tags"), // JSON array of tags
  customFields: text("custom_fields"), // JSON object for custom metadata
  images: text("images"), // JSON array of image URLs from ImgBB

  // Timestamps and user tracking
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),

  // Approval tracking
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by").references(() => users.id, { onDelete: "set null" }),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: text("rejected_by").references(() => users.id, { onDelete: "set null" }),
});

/**
 * Document versions - tracks all versions of a document
 */
export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 50 }).notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  changeDescription: text("change_description"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
});

/**
 * Document comments/reviews
 */
export const documentComments = pgTable("document_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  commentType: varchar("comment_type", { length: 50 }).notNull().default("general"),
  // general, review, approval, rejection
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  uploadedByUser: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
    relationName: "documentUploader",
  }),
  updatedByUser: one(users, {
    fields: [documents.updatedBy],
    references: [users.id],
    relationName: "documentUpdater",
  }),
  approvedByUser: one(users, {
    fields: [documents.approvedBy],
    references: [users.id],
    relationName: "documentApprover",
  }),
  rejectedByUser: one(users, {
    fields: [documents.rejectedBy],
    references: [users.id],
    relationName: "documentRejecter",
  }),
  versions: many(documentVersions),
  comments: many(documentComments),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, {
    fields: [documentVersions.documentId],
    references: [documents.id],
  }),
  uploadedByUser: one(users, {
    fields: [documentVersions.uploadedBy],
    references: [users.id],
  }),
}));

export const documentCommentsRelations = relations(documentComments, ({ one }) => ({
  document: one(documents, {
    fields: [documentComments.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentComments.userId],
    references: [users.id],
  }),
}));
