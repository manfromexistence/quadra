import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

let _db: LibSQLDatabase | null = null;

export const db = new Proxy({} as LibSQLDatabase, {
  get(_target, prop) {
    // Always use real database for Better Auth compatibility
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
