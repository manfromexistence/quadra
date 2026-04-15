import "dotenv/config";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";

// Load .env.local
config({ path: ".env.local" });

async function setAdmin() {
  const email = "ajju40959@gmail.com";

  // First, let's see the current user
  const currentUser = await db.select().from(user).where(eq(user.email, email));

  if (currentUser.length > 0) {
    console.log("Current user data:");
    console.log(JSON.stringify(currentUser[0], null, 2));
  }

  const result = await db
    .update(user)
    .set({
      role: "admin",
      organization: "QUADRA",
      jobTitle: "System Administrator",
      department: "IT",
      isActive: true,
    })
    .where(eq(user.email, email))
    .returning();

  if (result.length > 0) {
    console.log("\n✅ User updated successfully:");
    console.log(JSON.stringify(result[0], null, 2));
  } else {
    console.log("❌ User not found with email:", email);
  }
}

setAdmin()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
