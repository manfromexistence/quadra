import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { user } from "../schema";

// Teams table
export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  logoUrl: text("logo_url"),
  inboxId: text("inbox_id"),
  inboxEmail: text("inbox_email"),
  inboxForwarding: integer("inbox_forwarding", { mode: "boolean" }),
  baseCurrency: text("base_currency").default("USD"),
  documentClassification: integer("document_classification", { mode: "boolean" }).default(true),
  plan: text("plan").default("pro"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  canceledAt: integer("canceled_at", { mode: "timestamp" }),
});

// Bank Accounts table
export const bankAccounts = sqliteTable("bank_accounts", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  balance: real("balance").default(0),
  type: text("type"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Transactions table
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  bankAccountId: text("bank_account_id").references(() => bankAccounts.id),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  status: text("status"),
  category: text("category"),
  method: text("method"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Customers table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Invoices table
export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  customerId: text("customer_id").references(() => customers.id),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: integer("issue_date", { mode: "timestamp" }).notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("draft"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tracker Projects table
export const trackerProjects = sqliteTable("tracker_projects", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tracker Entries table
export const trackerEntries = sqliteTable("tracker_entries", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  projectId: text("project_id").references(() => trackerProjects.id),
  userId: text("user_id").notNull().references(() => user.id),
  description: text("description"),
  start: integer("start", { mode: "timestamp" }).notNull(),
  stop: integer("stop", { mode: "timestamp" }),
  duration: integer("duration"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Vault Files table
export const vaultFiles = sqliteTable("vault_files", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size"),
  type: text("type"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by").references(() => user.id),
});

// Inbox Items table
export const inboxItems = sqliteTable("inbox_items", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  displayName: text("display_name").notNull(),
  fileName: text("file_name"),
  filePath: text("file_path"),
  amount: real("amount"),
  currency: text("currency"),
  date: integer("date", { mode: "timestamp" }),
  status: text("status").default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
