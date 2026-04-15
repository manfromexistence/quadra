import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user as users } from "../schema";
import { documents } from "./documents";
import { projects } from "./projects";

/**
 * Transmittals - formal document transmission records
 */
export const transmittals = pgTable("transmittals", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  transmittalNumber: varchar("transmittal_number", { length: 100 }).notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description"),

  // Sender and recipient information
  sentFrom: text("sent_from")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  sentTo: text("sent_to").notNull(), // JSON array of user IDs
  ccTo: text("cc_to"), // JSON array of user IDs

  // Status tracking
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  // draft, sent, acknowledged, closed

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: text("acknowledged_by").references(() => users.id, { onDelete: "set null" }),

  // Additional metadata
  notes: text("notes"),
  customFields: text("custom_fields"), // JSON object
  images: text("images"), // JSON array of image URLs from ImgBB
});

/**
 * Transmittal documents - documents attached to transmittals
 */
export const transmittalDocuments = pgTable("transmittal_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  transmittalId: uuid("transmittal_id")
    .notNull()
    .references(() => transmittals.id, { onDelete: "cascade" }),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  remarks: text("remarks"),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// Relations
export const transmittalsRelations = relations(transmittals, ({ one, many }) => ({
  project: one(projects, {
    fields: [transmittals.projectId],
    references: [projects.id],
  }),
  sentFromUser: one(users, {
    fields: [transmittals.sentFrom],
    references: [users.id],
    relationName: "transmittalSender",
  }),
  acknowledgedByUser: one(users, {
    fields: [transmittals.acknowledgedBy],
    references: [users.id],
    relationName: "transmittalAcknowledger",
  }),
  documents: many(transmittalDocuments),
}));

export const transmittalDocumentsRelations = relations(transmittalDocuments, ({ one }) => ({
  transmittal: one(transmittals, {
    fields: [transmittalDocuments.transmittalId],
    references: [transmittals.id],
  }),
  document: one(documents, {
    fields: [transmittalDocuments.documentId],
    references: [documents.id],
  }),
}));
