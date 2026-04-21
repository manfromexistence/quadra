/**
 * Test script to verify Turso database connections
 * Run with: bun run src/db/test-db.ts
 */

import { db } from "@/db";
import { changeOrders } from "@/db/schema/change-orders";
import { commissioningChecklists } from "@/db/schema/commissioning";
import { letters } from "@/db/schema/correspondence";
import { dailyReports } from "@/db/schema/daily-reports";
import { documents } from "@/db/schema/documents";
import { extensionOfTimeRequests } from "@/db/schema/extension-of-time";
import { incomingTransmittals } from "@/db/schema/incoming-transmittals";
import { inspectionRequests } from "@/db/schema/inspections";
import { projects } from "@/db/schema/projects";
import { technicalQueries } from "@/db/schema/queries";
import { safetyObservations } from "@/db/schema/safety-observations";
import { submittals } from "@/db/schema/submittals";
import { transmittals } from "@/db/schema/transmittals";
import { warrantyRecords } from "@/db/schema/warranty";

async function testConnection() {
  console.log("🔍 Testing Turso database connections...\n");

  const tables = [
    { name: "projects", table: projects },
    { name: "documents", table: documents },
    { name: "transmittals", table: transmittals },
    { name: "incoming-transmittals", table: incomingTransmittals },
    { name: "technical-queries", table: technicalQueries },
    { name: "letters", table: letters },
    { name: "submittals", table: submittals },
    { name: "change-orders", table: changeOrders },
    { name: "inspections", table: inspectionRequests },
    { name: "extension-of-time", table: extensionOfTimeRequests },
    { name: "daily-reports", table: dailyReports },
    { name: "safety-observations", table: safetyObservations },
    { name: "commissioning", table: commissioningChecklists },
    { name: "warranty", table: warrantyRecords },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const { name, table } of tables) {
    try {
      // Try to query the table (limit to 1 row)
      await db.select().from(table).limit(1);
      console.log(`✅ ${name}: Connected`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${name}: Failed - ${error}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}/${tables.length}`);
  console.log(`   ❌ Errors: ${errorCount}/${tables.length}`);

  if (errorCount === 0) {
    console.log(`\n🎉 All database connections are working correctly!`);
  } else {
    console.log(
      `\n⚠️  Some database connections failed. Please check the errors above.`,
    );
    process.exit(1);
  }
}

testConnection().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
