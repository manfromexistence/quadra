import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Extension of Time Requests
export const extensionOfTimeRequests = sqliteTable(
  "extension_of_time_requests",
  {
    id: text("id").primaryKey(),
    eotNumber: text("eot_number").notNull().unique(),
    requestedDays: integer("requested_days").notNull(),
    reason: text("reason").notNull(),
    approvalStatus: text("approval_status").notNull().default("pending"), // pending, approved, rejected
    approvedDays: integer("approved_days"),
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
  },
);

// Relations
export const extensionOfTimeRequestsRelations = relations(
  extensionOfTimeRequests,
  ({ one }) => ({
    project: one(projects, {
      fields: [extensionOfTimeRequests.projectId],
      references: [projects.id],
    }),
    approvedByUser: one(user, {
      fields: [extensionOfTimeRequests.approvedBy],
      references: [user.id],
    }),
  }),
);
