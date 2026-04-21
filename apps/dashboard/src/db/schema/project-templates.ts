import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Project Templates
export const projectTemplates = sqliteTable("project_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // letter, memo, crs, mom, etc.
  category: text("category").notNull(), // Correspondence, Technical, Commercial, etc.
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  projectId: text("project_id").references(() => projects.id), // Optional - can be global or project-specific
  isGlobal: integer("is_global", { mode: "boolean" }).notNull().default(true),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const projectTemplatesRelations = relations(
  projectTemplates,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTemplates.projectId],
      references: [projects.id],
    }),
    uploadedByUser: one(user, {
      fields: [projectTemplates.uploadedBy],
      references: [user.id],
    }),
  }),
);
