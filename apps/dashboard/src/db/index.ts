import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { mockDb } from "./mock-db";
import * as schema from "./schema";

let _db: LibSQLDatabase | null = null;
let _useMockDb = false;

export const db = new Proxy({} as LibSQLDatabase, {
  get(_target, prop) {
    // Check if we should use mock database
    if (!process.env.DATABASE_URL) {
      console.log(
        "DATABASE_URL not set - using mock database with fallback data",
      );
      _useMockDb = true;
      return (mockDb as never)[prop];
    }

    // Use real database
    if (!_db) {
      try {
        const client = createClient({
          url: process.env.DATABASE_URL,
          authToken: process.env.DATABASE_AUTH_TOKEN,
        });
        _db = drizzle({ client, schema });
      } catch (error) {
        console.error(
          "Failed to connect to database, falling back to mock data:",
          error,
        );
        _useMockDb = true;
        return (mockDb as never)[prop];
      }
    }
    return (_db as never)[prop];
  },
});

export const isUsingMockDb = () => _useMockDb;
