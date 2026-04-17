import { db } from "./src/db";
import * as schema from "./src/db/schema";

async function testDatabase() {
  console.log("Testing database connection...\n");
  
  try {
    console.log("1. Testing teams query...");
    const teams = await db.select().from(schema.teams).limit(1);
    console.log("✅ Teams:", teams);
    
    console.log("\n2. Testing user query...");
    const users = await db.select().from(schema.user).limit(1);
    console.log("✅ Users:", users);
    
    console.log("\n3. Testing bankAccounts query...");
    const accounts = await db.select().from(schema.bankAccounts).limit(1);
    console.log("✅ Bank Accounts:", accounts);
    
    console.log("\n✅ All database queries successful!");
  } catch (error) {
    console.error("❌ Database error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

testDatabase();
