import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const edmsFileAssets = sqliteTable("edms_file_assets", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  folder: text("folder").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type"),
  fileSize: integer("file_size").notNull(),
  dataBase64: text("data_base64").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
