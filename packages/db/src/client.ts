import { createLoggerWithContext } from "@midday/logger";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const logger = createLoggerWithContext("db");

const isDevelopment = process.env.NODE_ENV === "development";

// Create Turso client
const tursoClient = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export const db = drizzle(tursoClient, {
  schema,
  casing: "snake_case",
});

export const primaryDb = db;

export const connectDb = async () => {
  return db;
};

export type Database = typeof db;
export type DatabaseOrTransaction = Database;
export type DatabaseWithPrimary = Database & {
  $primary?: Database;
  usePrimaryOnly?: () => Database;
};

export function getPoolStats() {
  return {
    primary: {
      total: 1,
      idle: 0,
      waiting: 0,
    },
    replica: null,
  };
}

export const closeDb = async (): Promise<void> => {
  tursoClient.close();
};
