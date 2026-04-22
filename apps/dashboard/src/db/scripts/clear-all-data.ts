import { db } from "@/db";
import { changeOrderDocuments, changeOrders } from "@/db/schema/change-orders";
import { commissioningChecklists } from "@/db/schema/commissioning";
import {
  letterRelatedDocuments,
  letters,
  memos,
  minutesOfMeeting,
  momActionItems,
  momAttendees,
} from "@/db/schema/correspondence";
import {
  dailyReportEquipment,
  dailyReportManpower,
  dailyReports,
} from "@/db/schema/daily-reports";
import {
  databookDocuments,
  databookMetadata,
  databookRules,
  databookSections,
} from "@/db/schema/databook";
import { documents, documentVersions } from "@/db/schema/documents";
import { edmsFileAssets } from "@/db/schema/edms-file-assets";
import { extensionOfTimeRequests } from "@/db/schema/extension-of-time";
import { incomingTransmittals } from "@/db/schema/incoming-transmittals";
import {
  inspectionRequestDocuments,
  inspectionRequests,
} from "@/db/schema/inspections";
import {
  bankAccounts,
  customers,
  inboxItems,
  invoices,
  teams,
  trackerEntries,
  trackerProjects,
  transactions,
  vaultFiles,
} from "@/db/schema/midday";
import { notifications } from "@/db/schema/notifications";
import {
  disciplines,
  documentTypes,
  projectConfig,
  stakeholders,
  workflowStepTemplates,
} from "@/db/schema/project-config";
import { projectTemplates } from "@/db/schema/project-templates";
import { projects } from "@/db/schema/projects";
import {
  queryLinkedDocuments,
  rfis,
  siteTechQueries,
  technicalQueries,
} from "@/db/schema/queries";
import { safetyObservations } from "@/db/schema/safety-observations";
import { scheduleActivities, scheduleSync } from "@/db/schema/schedule";
import { submittalDocuments, submittals } from "@/db/schema/submittals";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { warrantyDocuments, warrantyRecords } from "@/db/schema/warranty";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";

async function clearAllData() {
  console.log("Clearing all data from database tables...");

  // Delete in order of dependencies (child tables first)

  // Queries (TQ, STQ, RFI)
  await db.delete(queryLinkedDocuments);
  await db.delete(rfis);
  await db.delete(siteTechQueries);
  await db.delete(technicalQueries);
  console.log("✓ Cleared queries");

  // Midday tables
  await db.delete(inboxItems);
  await db.delete(vaultFiles);
  await db.delete(trackerEntries);
  await db.delete(trackerProjects);
  await db.delete(invoices);
  await db.delete(customers);
  await db.delete(transactions);
  await db.delete(bankAccounts);
  await db.delete(teams);
  console.log("✓ Cleared midday tables");

  // Change Orders
  await db.delete(changeOrderDocuments);
  await db.delete(changeOrders);
  console.log("✓ Cleared change orders");

  // Commissioning
  await db.delete(commissioningChecklists);
  console.log("✓ Cleared commissioning checklists");

  // Correspondence
  await db.delete(letterRelatedDocuments);
  await db.delete(momActionItems);
  await db.delete(momAttendees);
  await db.delete(minutesOfMeeting);
  await db.delete(memos);
  await db.delete(letters);
  console.log("✓ Cleared correspondence");

  // Daily Reports
  await db.delete(dailyReportEquipment);
  await db.delete(dailyReportManpower);
  await db.delete(dailyReports);
  console.log("✓ Cleared daily reports");

  // Databook
  await db.delete(databookRules);
  await db.delete(databookDocuments);
  await db.delete(databookSections);
  await db.delete(databookMetadata);
  console.log("✓ Cleared databook");

  // Documents
  await db.delete(documentVersions);
  await db.delete(documents);
  console.log("✓ Cleared documents");

  // EDMS File Assets
  await db.delete(edmsFileAssets);
  console.log("✓ Cleared EDMS file assets");

  // Extension of Time
  await db.delete(extensionOfTimeRequests);
  console.log("✓ Cleared extension of time requests");

  // Incoming Transmittals
  await db.delete(incomingTransmittals);
  console.log("✓ Cleared incoming transmittals");

  // Inspections
  await db.delete(inspectionRequestDocuments);
  await db.delete(inspectionRequests);
  console.log("✓ Cleared inspections");

  // Notifications
  await db.delete(notifications);
  console.log("✓ Cleared notifications");

  // Project Config
  await db.delete(workflowStepTemplates);
  await db.delete(stakeholders);
  await db.delete(documentTypes);
  await db.delete(disciplines);
  await db.delete(projectConfig);
  console.log("✓ Cleared project config");

  // Projects
  await db.delete(projects);
  console.log("✓ Cleared projects");

  // Project Templates
  await db.delete(projectTemplates);
  console.log("✓ Cleared project templates");

  // Safety Observations
  await db.delete(safetyObservations);
  console.log("✓ Cleared safety observations");

  // Schedule
  await db.delete(scheduleSync);
  await db.delete(scheduleActivities);
  console.log("✓ Cleared schedule");

  // Submittals
  await db.delete(submittalDocuments);
  await db.delete(submittals);
  console.log("✓ Cleared submittals");

  // Transmittals
  await db.delete(transmittalDocuments);
  await db.delete(transmittals);
  console.log("✓ Cleared transmittals");

  // Warranty
  await db.delete(warrantyDocuments);
  await db.delete(warrantyRecords);
  console.log("✓ Cleared warranty records");

  // Workflows
  await db.delete(workflowSteps);
  await db.delete(documentWorkflows);
  console.log("✓ Cleared workflows");

  console.log("\n✅ All data cleared successfully!");
}

clearAllData().catch(console.error);
