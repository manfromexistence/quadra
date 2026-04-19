import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../schema";
import { projects } from "./projects";

// Letters Register
export const letters = sqliteTable("letters", {
  id: text("id").primaryKey(),
  letterNumber: text("letter_number").notNull().unique(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  direction: text("direction").notNull(), // Outgoing, Incoming
  from: text("from").notNull(),
  to: text("to").notNull(),
  toType: text("to_type").notNull(), // Client, Vendor, Subcontractor, Consultant, Third Party
  subject: text("subject").notNull(),
  category: text("category").notNull(), // Progress Report, Procurement, Approval, Variation, Safety, etc.
  ref: text("ref"), // External reference number
  author: text("author")
    .notNull()
    .references(() => user.id),
  attachments: integer("attachments").notNull().default(0),
  status: text("status").notNull(), // Sent, Received, Awaiting Response, Responded
  urgent: integer("urgent", { mode: "boolean" }).notNull().default(false),
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

// Internal Memos
export const memos = sqliteTable("memos", {
  id: text("id").primaryKey(),
  memoNumber: text("memo_number").notNull().unique(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  from: text("from").notNull(), // Role/position
  to: text("to").notNull(), // Recipients
  subject: text("subject").notNull(),
  category: text("category").notNull(), // Internal, Administrative, Quality, Safety, etc.
  content: text("content").notNull(),
  urgent: integer("urgent", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull(), // Draft, Distributed, Archived
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

// Minutes of Meeting (MoM)
export const minutesOfMeeting = sqliteTable("minutes_of_meeting", {
  id: text("id").primaryKey(),
  momNumber: text("mom_number").notNull().unique(),
  meetingDate: integer("meeting_date", { mode: "timestamp" }).notNull(),
  issuedDate: integer("issued_date", { mode: "timestamp" }).notNull(),
  meetingType: text("meeting_type").notNull(), // Weekly Progress, Design Review, Safety, Kickoff, Closeout, etc.
  title: text("title").notNull(),
  location: text("location").notNull(),
  chairperson: text("chairperson").notNull(),
  minuteTaker: text("minute_taker")
    .notNull()
    .references(() => user.id),
  agenda: text("agenda").notNull(), // JSON array
  decisions: text("decisions").notNull(), // JSON array
  nextMeeting: integer("next_meeting", { mode: "timestamp" }),
  status: text("status").notNull(), // Draft, Issued, Approved
  distribution: text("distribution").notNull(), // JSON array of stakeholder codes
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

// MoM Attendees
export const momAttendees = sqliteTable("mom_attendees", {
  id: text("id").primaryKey(),
  momId: text("mom_id")
    .notNull()
    .references(() => minutesOfMeeting.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  role: text("role"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// MoM Action Items
export const momActionItems = sqliteTable("mom_action_items", {
  id: text("id").primaryKey(),
  momId: text("mom_id")
    .notNull()
    .references(() => minutesOfMeeting.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  assignedTo: text("assigned_to").notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }),
  status: text("status").notNull().default("Open"), // Open, In Progress, Completed, Overdue
  completedDate: integer("completed_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Letter Related Documents
export const letterRelatedDocuments = sqliteTable("letter_related_documents", {
  id: text("id").primaryKey(),
  letterId: text("letter_id")
    .notNull()
    .references(() => letters.id, { onDelete: "cascade" }),
  documentCode: text("document_code").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const lettersRelations = relations(letters, ({ one, many }) => ({
  project: one(projects, {
    fields: [letters.projectId],
    references: [projects.id],
  }),
  authorUser: one(user, {
    fields: [letters.author],
    references: [user.id],
  }),
  relatedDocuments: many(letterRelatedDocuments),
}));

export const memosRelations = relations(memos, ({ one }) => ({
  project: one(projects, {
    fields: [memos.projectId],
    references: [projects.id],
  }),
}));

export const minutesOfMeetingRelations = relations(
  minutesOfMeeting,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [minutesOfMeeting.projectId],
      references: [projects.id],
    }),
    minuteTakerUser: one(user, {
      fields: [minutesOfMeeting.minuteTaker],
      references: [user.id],
    }),
    attendees: many(momAttendees),
    actionItems: many(momActionItems),
  }),
);

export const momAttendeesRelations = relations(momAttendees, ({ one }) => ({
  mom: one(minutesOfMeeting, {
    fields: [momAttendees.momId],
    references: [minutesOfMeeting.id],
  }),
}));

export const momActionItemsRelations = relations(momActionItems, ({ one }) => ({
  mom: one(minutesOfMeeting, {
    fields: [momActionItems.momId],
    references: [minutesOfMeeting.id],
  }),
}));

export const letterRelatedDocumentsRelations = relations(
  letterRelatedDocuments,
  ({ one }) => ({
    letter: one(letters, {
      fields: [letterRelatedDocuments.letterId],
      references: [letters.id],
    }),
  }),
);
