// Simple test script to verify mock data is working
// Run with: bun run test-mock-data.ts

import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Force mock data mode
process.env.USE_MOCK_DATA = "true";

async function testMockData() {
  console.log("🧪 Testing Mock Data System\n");

  // Import after setting env vars
  const { db } = await import("./src/db/index");

  try {
    // Test 1: Query users
    console.log("1️⃣ Testing user queries...");
    const users = await db.query.user.findMany();
    console.log(`   ✅ Found ${users.length} users`);
    console.log(`   📝 Sample: ${users[0]?.name} (${users[0]?.email})\n`);

    // Test 2: Query projects
    console.log("2️⃣ Testing project queries...");
    const projects = await db.query.projects.findMany();
    console.log(`   ✅ Found ${projects.length} projects`);
    console.log(`   📝 Sample: ${projects[0]?.name}\n`);

    // Test 3: Query documents
    console.log("3️⃣ Testing document queries...");
    const documents = await db.query.documents.findMany();
    console.log(`   ✅ Found ${documents.length} documents`);
    console.log(`   📝 Sample: ${documents[0]?.title}\n`);

    // Test 4: Query notifications
    console.log("4️⃣ Testing notification queries...");
    const notifications = await db.query.notifications.findMany();
    console.log(`   ✅ Found ${notifications.length} notifications`);
    console.log(`   📝 Sample: ${notifications[0]?.title}\n`);

    // Test 5: Query teams (Midday)
    console.log("5️⃣ Testing team queries (Midday)...");
    const teams = await db.query.teams.findMany();
    console.log(`   ✅ Found ${teams.length} teams`);
    console.log(`   📝 Sample: ${teams[0]?.name}\n`);

    // Test 6: Query transactions
    console.log("6️⃣ Testing transaction queries...");
    const transactions = await db.query.transactions.findMany();
    console.log(`   ✅ Found ${transactions.length} transactions`);
    console.log(`   📝 Sample: ${transactions[0]?.name} - $${transactions[0]?.amount}\n`);

    console.log("✨ All tests passed! Mock data system is working correctly.\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testMockData();
