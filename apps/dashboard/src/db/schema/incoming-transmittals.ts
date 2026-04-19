import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

export const incomingTransmittals = sqliteTable("incoming_transmittals", {
  id: text("id").primaryKey(),
  transmittalNumber: text("transmittal_number").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  receivedDate: integer("received_date", { mode: "timestamp" }).notNull(),
  from: text("from").notNull(), // CLT, VND, SUB, THP
  fromOrg: text("from_org").notNull(),
  subject: text("subject").notNull(),
  purpose: text("purpose").notNull(), // IFR, IFA, IFC, IFI
  theirRef: text("their_ref"),
  responseRequired: integer("response_required", { mode: "boolean" })
    .notNull()
    .default(false),
  responseDue: integer("response_due", { mode: "timestamp" }),
  responseStatus: text("response_status").notNull(), // Pending, In Progress, Responded, Acknowledged, No Response Required, Closed
  assignedTo: text("assigned_to").references(() => user.id),
  priority: text("priority").notNull(), // High, Medium, Low
  notes: text("notes"),
  attachments: integer("attachments").notNull().default(0),
  responseBy: text("response_by").references(() => user.id),
  responseDate: integer("response_date", { mode: "timestamp" }),
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

export const incomingTransmittalDocuments = sqliteTable(
  "incoming_transmittal_documents",
  {
    id: text("id").primaryKey(),
    transmittalId: text("transmittal_id")
      .notNull()
      .references(() => incomingTransmittals.id, { onDelete: "cascade" }),
    documentCode: text("document_code").notNull(),
    title: text("title").notNull(),
    revision: text("revision").notNull(),
    status: text("status").notNull(), // Approved, Approved with Comments, For Review, For Information, Revise & Resubmit
    ourAction: text("our_action"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
);

export const incomingTransmittalsRelations = relations(
  incomingTransmittals,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [incomingTransmittals.projectId],
      references: [projects.id],
    }),
    assignedUser: one(user, {
      fields: [incomingTransmittals.assignedTo],
      references: [user.id],
      relationName: "assignedUser",
    }),
    responseUser: one(user, {
      fields: [incomingTransmittals.responseBy],
      references: [user.id],
      relationName: "responseUser",
    }),
    documents: many(incomingTransmittalDocuments),
  }),
);

export const incomingTransmittalDocumentsRelations = relations(
  incomingTransmittalDocuments,
  ({ one }) => ({
    transmittal: one(incomingTransmittals, {
      fields: [incomingTransmittalDocuments.transmittalId],
      references: [incomingTransmittals.id],
    }),
  }),
);
