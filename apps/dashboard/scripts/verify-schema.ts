import { db } from "@/db";
import * as schema from "@/db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

const verifySchema = async () => {
  console.log("🔍 Verifying database schema...\n");

  try {
    // Check if we can query the user table
    const users = await db.select().from(schema.user);
    console.log("✅ User table accessible");
    console.log(`   Found ${users.length} users\n`);

    // Check session table
    const sessions = await db.select().from(schema.session);
    console.log("✅ Session table accessible");
    console.log(`   Found ${sessions.length} sessions\n`);

    // Check account table
    const accounts = await db.select().from(schema.account);
    console.log("✅ Account table accessible");
    console.log(`   Found ${accounts.length} accounts\n`);

    // Check verification table
    const verifications = await db.select().from(schema.verification);
    console.log("✅ Verification table accessible");
    console.log(`   Found ${verifications.length} verifications\n`);

    console.log("🎉 All tables are working correctly!");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  process.exit(0);
};

verifySchema();
