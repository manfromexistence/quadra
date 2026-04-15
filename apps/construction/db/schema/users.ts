import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Extended user table for EDMS
 * This extends the base user table from Better Auth with construction-specific fields
 */
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),

  // EDMS-specific fields
  role: text("role").default("user"),
  // admin, client, pmc, vendor, subcontractor, user
  organization: text("organization"),
  jobTitle: text("job_title"),
  phone: text("phone"),
  department: text("department"),
  notificationPreferences: text("notification_preferences"),
  isActive: boolean("is_active").default(true),
});

// Export the user table as 'users' for consistency with new schema files
export { users as user };
