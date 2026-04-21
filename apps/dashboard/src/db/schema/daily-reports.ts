import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Daily Reports
export const dailyReports = sqliteTable("daily_reports", {
  id: text("id").primaryKey(),
  reportDate: integer("report_date", { mode: "timestamp" }).notNull(),
  weather: text("weather"),
  activitiesCompleted: text("activities_completed"),
  issues: text("issues"),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Daily Report Manpower
export const dailyReportManpower = sqliteTable("daily_report_manpower", {
  id: text("id").primaryKey(),
  dailyReportId: text("daily_report_id")
    .notNull()
    .references(() => dailyReports.id, { onDelete: "cascade" }),
  trade: text("trade").notNull(),
  count: integer("count").notNull(),
});

// Daily Report Equipment
export const dailyReportEquipment = sqliteTable("daily_report_equipment", {
  id: text("id").primaryKey(),
  dailyReportId: text("daily_report_id")
    .notNull()
    .references(() => dailyReports.id, { onDelete: "cascade" }),
  equipment: text("equipment").notNull(),
  count: integer("count").notNull(),
});

// Relations
export const dailyReportsRelations = relations(
  dailyReports,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [dailyReports.projectId],
      references: [projects.id],
    }),
    createdByUser: one(user, {
      fields: [dailyReports.createdBy],
      references: [user.id],
    }),
    manpower: many(dailyReportManpower),
    equipment: many(dailyReportEquipment),
  }),
);

export const dailyReportManpowerRelations = relations(
  dailyReportManpower,
  ({ one }) => ({
    dailyReport: one(dailyReports, {
      fields: [dailyReportManpower.dailyReportId],
      references: [dailyReports.id],
    }),
  }),
);

export const dailyReportEquipmentRelations = relations(
  dailyReportEquipment,
  ({ one }) => ({
    dailyReport: one(dailyReports, {
      fields: [dailyReportEquipment.dailyReportId],
      references: [dailyReports.id],
    }),
  }),
);
