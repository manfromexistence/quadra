import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Safety Observations
export const safetyObservations = sqliteTable("safety_observations", {
  id: text("id").primaryKey(),
  observationNumber: text("observation_number").notNull().unique(),
  type: text("type").notNull(), // unsafe_condition, unsafe_act, near_miss
  severity: text("severity").notNull(), // low, medium, high, critical
  location: text("location").notNull(),
  description: text("description").notNull(),
  immediateAction: text("immediate_action"),
  status: text("status").notNull().default("open"), // open, in_progress, closed
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  observedBy: text("observed_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  assignedTo: text("assigned_to").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const safetyObservationsRelations = relations(
  safetyObservations,
  ({ one }) => ({
    project: one(projects, {
      fields: [safetyObservations.projectId],
      references: [projects.id],
    }),
    observedByUser: one(user, {
      fields: [safetyObservations.observedBy],
      references: [user.id],
    }),
    assignedToUser: one(user, {
      fields: [safetyObservations.assignedTo],
      references: [user.id],
    }),
  }),
);
