import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function testDirectQuery() {
  console.log("Testing direct Turso query...");
  
  try {
    const result = await db.execute("SELECT * FROM teams LIMIT 1");
    console.log("✅ Teams query successful:");
    console.log(JSON.stringify(result.rows, null, 2));
    
    const userResult = await db.execute("SELECT id, email, name, role FROM user LIMIT 1");
    console.log("\n✅ User query successful:");
    console.log(JSON.stringify(userResult.rows, null, 2));
    
  } catch (error) {
    console.error("❌ Query failed:", error);
  }
}

testDirectQuery();
