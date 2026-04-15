import { db } from "./src/db";
import { teams, user } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test 1: Select from teams
    console.log("\n1. Testing teams query...");
    const teamsResult = await db.select().from(teams).limit(5);
    console.log("Teams:", teamsResult);
    
    // Test 2: Select from user
    console.log("\n2. Testing user query...");
    const usersResult = await db.select().from(user).limit(5);
    console.log("Users:", usersResult);
    
    // Test 3: Select specific team
    console.log("\n3. Testing specific team query...");
    const specificTeam = await db.select().from(teams).where(eq(teams.id, "team-001")).limit(1);
    console.log("Specific team:", specificTeam);
    
    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

testConnection();
