import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user as users } from "../schema";
import { documents } from "./documents";
import { projects } from "./projects";

/**
 * Notifications - system notifications for users
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Notification content
  type: varchar("type", { length: 50 }).notNull(),
  // document_submitted, review_request, document_approved, document_rejected,
  // comment_added, transmittal_received, workflow_assigned, etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),

  // Related entities
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }),
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // project, document, transmittal, workflow
  relatedEntityId: uuid("related_entity_id"),

  // Action link
  actionUrl: text("action_url"),

  // Status
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Email notification tracking
  emailSent: boolean("email_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
});

/**
 * Activity log - audit trail of all actions in the system
 */
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),

  // Activity details
  action: varchar("action", { length: 100 }).notNull(),
  // document_uploaded, document_approved, document_rejected, project_created,
  // user_assigned, transmittal_sent, etc.
  entityType: varchar("entity_type", { length: 50 }).notNull(), // project, document, transmittal, user
  entityId: uuid("entity_id").notNull(),
  entityName: varchar("entity_name", { length: 500 }),

  // Additional context
  description: text("description"),
  metadata: text("metadata"), // JSON object with additional details

  // IP and user agent for security
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  // Timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
  document: one(documents, {
    fields: [notifications.documentId],
    references: [documents.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [activityLog.projectId],
    references: [projects.id],
  }),
}));
