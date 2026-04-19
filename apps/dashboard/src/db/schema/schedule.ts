import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { projects } from "./projects";

export const scheduleActivities = sqliteTable("schedule_activities", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  activityCode: text("activity_code").notNull(),
  name: text("name").notNull(),
  wbs: text("wbs").notNull(),
  phase: text("phase").notNull(), // engineering, procurement, construction, commissioning
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(), // YYYY-MM-DD
  plannedProgress: integer("planned_progress").notNull().default(0), // 0-100
  actualProgress: integer("actual_progress").notNull().default(0), // 0-100
  linkedDocuments: text("linked_documents"), // JSON array of document codes
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const scheduleSync = sqliteTable("schedule_sync", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  source: text("source").notNull(), // Primavera P6, MS Project, etc.
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }).notNull(),
  syncedBy: text("synced_by").notNull(),
  projectStart: text("project_start").notNull(), // YYYY-MM-DD
  projectEnd: text("project_end").notNull(), // YYYY-MM-DD
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
