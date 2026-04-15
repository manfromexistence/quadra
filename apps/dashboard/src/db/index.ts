import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { mockDb } from "./mock-db";

let _db: LibSQLDatabase | null = null;

// Check if we should use mock data
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true" || process.env.NODE_ENV === "development";

export const db = new Proxy({} as LibSQLDatabase, {
  get(_target, prop) {
    // Use mock database if enabled
    if (USE_MOCK_DATA) {
      return (mockDb as never)[prop];
    }

    // Otherwise use real database
    if (!_db) {
      if (!process.env.DATABASE_URL) {
        throw new Error(
          "DATABASE_URL is not set. Database features are disabled in local development without a database.",
        );
      }
      const client = createClient({
        url: process.env.DATABASE_URL,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });
      _db = drizzle({ client, schema });
    }
    return (_db as never)[prop];
  },
});
