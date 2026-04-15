import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

const applySchema = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("📦 Connecting to Turso database...");

  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  // Read the SQL migration file
  const sqlPath = join(process.cwd(), "drizzle", "0000_same_texas_twister.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("📝 Applying schema...");
  console.log("SQL file:", sqlPath);

  // Split by statement separator and execute each statement
  const statements = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
    console.log(statement.substring(0, 100) + "...");

    try {
      await client.execute(statement);
      console.log("✅ Success");
    } catch (error: any) {
      console.error("❌ Failed:", error.message);
      // Continue with other statements even if one fails
    }
  }

  console.log("\n🎉 Schema application complete!");

  // Verify tables were created
  console.log("\n🔍 Verifying tables...");
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("Tables created:", tables.rows);

  process.exit(0);
};

applySchema().catch((err) => {
  console.error("❌ Schema application failed");
  console.error(err);
  process.exit(1);
});
