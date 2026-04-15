import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const testConnection = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("Testing connection to Turso...");
  console.log("URL:", process.env.DATABASE_URL);
  console.log("Token length:", process.env.DATABASE_AUTH_TOKEN?.length || 0);

  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const result = await client.execute("SELECT 1 as test");
    console.log("✅ Connection successful!");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);
  }

  process.exit(0);
};

testConnection();
