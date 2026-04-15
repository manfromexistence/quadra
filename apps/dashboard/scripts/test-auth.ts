import { db } from "@/db";
import * as schema from "@/db/schema";
import { config } from "dotenv";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const testAuth = async () => {
  console.log("🧪 Testing Authentication System\n");

  try {
    // Test 1: Create a test user
    console.log("1️⃣ Creating test user...");
    const hashedPassword = await bcrypt.hash("testpassword123", 10);
    const testUser = {
      id: "test-user-" + Date.now(),
      name: "Test User",
      email: "test@quadra-edms.com",
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "user",
      organization: "Test Organization",
      jobTitle: "Test Engineer",
      phone: "+1234567890",
      department: "Engineering",
      notificationPreferences: null,
      isActive: true,
    };

    await db.insert(schema.user).values(testUser);
    console.log("✅ Test user created:", testUser.email);

    // Test 2: Create account entry for email/password
    console.log("\n2️⃣ Creating account entry...");
    const testAccount = {
      id: "test-account-" + Date.now(),
      accountId: testUser.id,
      providerId: "credential",
      userId: testUser.id,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(schema.account).values(testAccount);
    console.log("✅ Account entry created");

    // Test 3: Verify user can be queried
    console.log("\n3️⃣ Verifying user query...");
    const { eq } = await import("drizzle-orm");
    const users = await db.select().from(schema.user).where(eq(schema.user.email, testUser.email));
    console.log("✅ User found:", users[0]?.name);

    // Test 4: Check all tables
    console.log("\n4️⃣ Checking all tables...");
    const userCount = (await db.select().from(schema.user)).length;
    const sessionCount = (await db.select().from(schema.session)).length;
    const accountCount = (await db.select().from(schema.account)).length;
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Accounts: ${accountCount}`);

    console.log("\n🎉 Authentication system is ready!");
    console.log("\n📝 Test Credentials:");
    console.log("   Email: test@quadra-edms.com");
    console.log("   Password: testpassword123");
    console.log("\n🚀 Start the dev server and visit http://localhost:3001/login");

  } catch (error) {
    console.error("❌ Error:", error);
  }

  process.exit(0);
};

testAuth();
