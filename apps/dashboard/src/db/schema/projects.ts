import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectNumber: text("project_number").unique(),
  location: text("location"),
  clientId: text("client_id").references(() => user.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull().default("active"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  images: text("images"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const projectMembers = sqliteTable("project_members", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  permissions: text("permissions"),
  assignedAt: integer("assigned_at", { mode: "timestamp" }).notNull(),
  assignedBy: text("assigned_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
