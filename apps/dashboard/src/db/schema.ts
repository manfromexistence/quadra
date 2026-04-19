import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// Type for theme styles (matching construction's ThemeStyles)
export type ThemeStyles = {
  light: Record<string, string>;
  dark: Record<string, string>;
};

// ============================================
// BETTER AUTH TABLES
// ============================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // EDMS-specific fields for Construction project
  role: text("role").default("user"), // admin, client, pmc, vendor, subcontractor, user
  organization: text("organization"),
  jobTitle: text("job_title"),
  phone: text("phone"),
  department: text("department"),
  notificationPreferences: text("notification_preferences"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ============================================
// THEME TABLES
// ============================================

export const theme = sqliteTable("theme", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  styles: text("styles", { mode: "json" }).$type<ThemeStyles>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const communityTheme = sqliteTable(
  "community_theme",
  {
    id: text("id").primaryKey(),
    themeId: text("theme_id")
      .notNull()
      .unique()
      .references(() => theme.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
    likeCount: integer("like_count").notNull().default(0),
  },
  (table) => ({
    publishedAtIdx: index("community_theme_published_at_idx").on(
      table.publishedAt,
    ),
    likeCountIdx: index("community_theme_like_count_idx").on(table.likeCount),
  }),
);

export const communityThemeTag = sqliteTable(
  "community_theme_tag",
  {
    communityThemeId: text("community_theme_id")
      .notNull()
      .references(() => communityTheme.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.communityThemeId, table.tag] }),
    tagIdx: index("community_theme_tag_tag_idx").on(table.tag),
  }),
);

export const themeLike = sqliteTable(
  "theme_like",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    themeId: text("theme_id")
      .notNull()
      .references(() => communityTheme.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.themeId] }),
  }),
);

// ============================================
// AI USAGE TABLE
// ============================================

export const aiUsage = sqliteTable("ai_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  modelId: text("model_id").notNull(),
  promptTokens: text("prompt_tokens").notNull().default("0"),
  completionTokens: text("completion_tokens").notNull().default("0"),
  daysSinceEpoch: text("days_since_epoch").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// SUBSCRIPTION TABLE
// ============================================

export const subscription = sqliteTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  modifiedAt: integer("modifiedAt", { mode: "timestamp" }),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: integer("currentPeriodStart", {
    mode: "timestamp",
  }).notNull(),
  currentPeriodEnd: integer("currentPeriodEnd", {
    mode: "timestamp",
  }).notNull(),
  cancelAtPeriodEnd: integer("cancelAtPeriodEnd", { mode: "boolean" })
    .notNull()
    .default(false),
  canceledAt: integer("canceledAt", { mode: "timestamp" }),
  startedAt: integer("startedAt", { mode: "timestamp" }).notNull(),
  endsAt: integer("endsAt", { mode: "timestamp" }),
  endedAt: integer("endedAt", { mode: "timestamp" }),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// ============================================
// OAUTH 2.0 TABLES
// ============================================

export const oauthApp = sqliteTable("oauth_app", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: text("client_id").notNull().unique(),
  clientSecretHash: text("client_secret_hash").notNull(),
  redirectUris: text("redirect_uris", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const oauthAuthorizationCode = sqliteTable("oauth_authorization_code", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  appId: text("app_id")
    .notNull()
    .references(() => oauthApp.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
  redirectUri: text("redirect_uri").notNull(),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: text("code_challenge_method"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const oauthToken = sqliteTable("oauth_token", {
  id: text("id").primaryKey(),
  accessTokenHash: text("access_token_hash").notNull().unique(),
  refreshTokenHash: text("refresh_token_hash").unique(),
  appId: text("app_id")
    .notNull()
    .references(() => oauthApp.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }).notNull(),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export * from "./schema/correspondence";
export * from "./schema/databook";
export * from "./schema/documents";
export * from "./schema/edms-file-assets";
export * from "./schema/incoming-transmittals";
export * from "./schema/midday";
export * from "./schema/notifications";
export * from "./schema/projects";
export * from "./schema/queries";
export * from "./schema/schedule";
export * from "./schema/transmittals";
export * from "./schema/workflows";
