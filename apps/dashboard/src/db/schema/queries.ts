import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Technical Queries (TQ)
export const technicalQueries = sqliteTable("technical_queries", {
  id: text("id").primaryKey(),
  queryNumber: text("query_number").notNull().unique(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  raisedBy: text("raised_by")
    .notNull()
    .references(() => user.id),
  discipline: text("discipline").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // Open, Responded, Closed
  priority: text("priority").notNull(), // High, Medium, Low
  assignedTo: text("assigned_to").notNull(), // CLT, VND, SUB, THP, or user ID
  dueDate: integer("due_date", { mode: "timestamp" }),
  responseDate: integer("response_date", { mode: "timestamp" }),
  response: text("response"),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Site Technical Queries (STQ)
export const siteTechQueries = sqliteTable("site_tech_queries", {
  id: text("id").primaryKey(),
  queryNumber: text("query_number").notNull().unique(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  raisedBy: text("raised_by").notNull(), // Usually "Site Team"
  discipline: text("discipline").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  location: text("location"), // Site location/grid reference
  status: text("status").notNull(), // Open, Responded, Closed
  priority: text("priority").notNull(), // High, Medium, Low
  assignedTo: text("assigned_to")
    .notNull()
    .references(() => user.id),
  dueDate: integer("due_date", { mode: "timestamp" }),
  responseDate: integer("response_date", { mode: "timestamp" }),
  response: text("response"),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// RFIs (Request for Information)
export const rfis = sqliteTable("rfis", {
  id: text("id").primaryKey(),
  rfiNumber: text("rfi_number").notNull().unique(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  raisedBy: text("raised_by").notNull(), // Organization name
  from: text("from").notNull(), // CLT, VND, SUB, THP, SUP
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Materials, Design, QA/QC, Safety, etc.
  status: text("status").notNull(), // Under Review, Responded, Closed
  priority: text("priority").notNull(), // High, Medium, Low
  assignedTo: text("assigned_to")
    .notNull()
    .references(() => user.id),
  dueDate: integer("due_date", { mode: "timestamp" }),
  responseDate: integer("response_date", { mode: "timestamp" }),
  response: text("response"),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Query/RFI Linked Documents
export const queryLinkedDocuments = sqliteTable("query_linked_documents", {
  id: text("id").primaryKey(),
  queryId: text("query_id").notNull(), // Can be TQ, STQ, or RFI ID
  queryType: text("query_type").notNull(), // TQ, STQ, RFI
  documentCode: text("document_code").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const technicalQueriesRelations = relations(
  technicalQueries,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [technicalQueries.projectId],
      references: [projects.id],
    }),
    raisedByUser: one(user, {
      fields: [technicalQueries.raisedBy],
      references: [user.id],
    }),
    linkedDocuments: many(queryLinkedDocuments),
  }),
);

export const siteTechQueriesRelations = relations(
  siteTechQueries,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [siteTechQueries.projectId],
      references: [projects.id],
    }),
    assignedUser: one(user, {
      fields: [siteTechQueries.assignedTo],
      references: [user.id],
    }),
    linkedDocuments: many(queryLinkedDocuments),
  }),
);

export const rfisRelations = relations(rfis, ({ one, many }) => ({
  project: one(projects, {
    fields: [rfis.projectId],
    references: [projects.id],
  }),
  assignedUser: one(user, {
    fields: [rfis.assignedTo],
    references: [user.id],
  }),
  linkedDocuments: many(queryLinkedDocuments),
}));

export const queryLinkedDocumentsRelations = relations(
  queryLinkedDocuments,
  ({ one }) => ({
    technicalQuery: one(technicalQueries, {
      fields: [queryLinkedDocuments.queryId],
      references: [technicalQueries.id],
    }),
    siteQuery: one(siteTechQueries, {
      fields: [queryLinkedDocuments.queryId],
      references: [siteTechQueries.id],
    }),
    rfi: one(rfis, {
      fields: [queryLinkedDocuments.queryId],
      references: [rfis.id],
    }),
  }),
);
