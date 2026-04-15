import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user as users } from "../schema";

/**
 * Projects table - stores construction project information
 */
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectNumber: varchar("project_number", { length: 100 }).unique(),
  location: text("location"),
  clientId: text("client_id").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, on-hold, completed, archived
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  images: text("images"), // JSON array of image URLs from ImgBB
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
});

/**
 * Project members - users assigned to projects with specific roles
 */
export const projectMembers = pgTable("project_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(), // client, pmc, vendor, subcontractor, admin
  permissions: text("permissions"), // JSON string of specific permissions
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedBy: text("assigned_by").references(() => users.id, { onDelete: "set null" }),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
    relationName: "projectClient",
  }),
  createdByUser: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
    relationName: "projectCreator",
  }),
  members: many(projectMembers),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
  assignedByUser: one(users, {
    fields: [projectMembers.assignedBy],
    references: [users.id],
    relationName: "memberAssigner",
  }),
}));
