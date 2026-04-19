import { db } from "@/db";
import {
  databookDocuments,
  databookMetadata,
  databookRules,
  databookSections,
} from "@/db/schema/databook";
import { projects } from "@/db/schema/projects";
import { scheduleActivities, scheduleSync } from "@/db/schema/schedule";

async function seedScheduleAndDatabook() {
  console.log("🌱 Seeding schedule and databook tables...");

  // Get the first project
  const allProjects = await db.select().from(projects).limit(1);
  if (allProjects.length === 0) {
    console.error("❌ No projects found. Please run seed-edms.ts first.");
    process.exit(1);
  }

  const projectId = allProjects[0].id;
  console.log(`📦 Using project: ${allProjects[0].name} (${projectId})`);

  // Seed schedule sync info
  const syncId = `sync-${Date.now()}`;
  await db.insert(scheduleSync).values({
    id: syncId,
    projectId,
    source: "Primavera P6",
    lastSyncAt: new Date("2026-04-16T08:30:00"),
    syncedBy: "S. Kumar",
    projectStart: "2026-01-01",
    projectEnd: "2026-12-31",
    createdAt: new Date(),
  });
  console.log("✅ Schedule sync info created");

  // Seed schedule activities
  const activities = [
    {
      id: `act-${Date.now()}-1`,
      projectId,
      activityCode: "ACT-001",
      name: "Detailed Engineering — Civil Works",
      wbs: "1.2.1",
      phase: "engineering",
      startDate: "2026-01-15",
      endDate: "2026-05-30",
      plannedProgress: 65,
      actualProgress: 68,
      linkedDocuments: JSON.stringify(["AHR-CIV-DWG-0001", "AHR-CIV-CAL-0012"]),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `act-${Date.now()}-2`,
      projectId,
      activityCode: "ACT-002",
      name: "Equipment Procurement — Heat Exchangers",
      wbs: "2.1.3",
      phase: "procurement",
      startDate: "2026-03-01",
      endDate: "2026-08-15",
      plannedProgress: 42,
      actualProgress: 38,
      linkedDocuments: JSON.stringify(["AHR-MEC-SPC-0023"]),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `act-${Date.now()}-3`,
      projectId,
      activityCode: "ACT-003",
      name: "Foundation Construction — Unit 100",
      wbs: "3.1.1",
      phase: "construction",
      startDate: "2026-04-01",
      endDate: "2026-09-30",
      plannedProgress: 28,
      actualProgress: 25,
      linkedDocuments: JSON.stringify([]),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `act-${Date.now()}-4`,
      projectId,
      activityCode: "ACT-004",
      name: "Electrical Installation — Substation",
      wbs: "3.2.4",
      phase: "construction",
      startDate: "2026-06-01",
      endDate: "2026-11-15",
      plannedProgress: 15,
      actualProgress: 18,
      linkedDocuments: JSON.stringify(["AHR-ELE-DWG-0045"]),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `act-${Date.now()}-5`,
      projectId,
      activityCode: "ACT-005",
      name: "Pre-Commissioning — Control Systems",
      wbs: "4.1.2",
      phase: "commissioning",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
      plannedProgress: 8,
      actualProgress: 5,
      linkedDocuments: JSON.stringify(["AHR-INS-DAT-0008"]),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.insert(scheduleActivities).values(activities);
  console.log(`✅ ${activities.length} schedule activities created`);

  // Seed databook sections
  const sections = [
    {
      id: `sec-${Date.now()}-1`,
      projectId,
      code: "SEC-01",
      title: "Project Management & Contracts",
      requiredCount: 12,
      collectedCount: 12,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `sec-${Date.now()}-2`,
      projectId,
      code: "SEC-02",
      title: "Engineering Design Documentation",
      requiredCount: 45,
      collectedCount: 38,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `sec-${Date.now()}-3`,
      projectId,
      code: "SEC-03",
      title: "Vendor Documentation & Data Sheets",
      requiredCount: 28,
      collectedCount: 22,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `sec-${Date.now()}-4`,
      projectId,
      code: "SEC-04",
      title: "Inspection & Test Records",
      requiredCount: 34,
      collectedCount: 18,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `sec-${Date.now()}-5`,
      projectId,
      code: "SEC-05",
      title: "Material Certificates & Mill Test Reports",
      requiredCount: 56,
      collectedCount: 42,
      sortOrder: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `sec-${Date.now()}-6`,
      projectId,
      code: "SEC-06",
      title: "Commissioning & Startup Documentation",
      requiredCount: 22,
      collectedCount: 8,
      sortOrder: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `sec-${Date.now()}-7`,
      projectId,
      code: "SEC-07",
      title: "As-Built Drawings & Red-Line Markups",
      requiredCount: 38,
      collectedCount: 15,
      sortOrder: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.insert(databookSections).values(sections);
  console.log(`✅ ${sections.length} databook sections created`);

  // Seed databook documents for each section
  const documents = [
    // SEC-01
    {
      id: `doc-${Date.now()}-1`,
      sectionId: sections[0].id,
      documentCode: "PMC-001",
      title: "Project Execution Plan",
      status: "collected",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `doc-${Date.now()}-2`,
      sectionId: sections[0].id,
      documentCode: "PMC-002",
      title: "Quality Management Plan",
      status: "collected",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `doc-${Date.now()}-3`,
      sectionId: sections[0].id,
      documentCode: "PMC-003",
      title: "HSE Management Plan",
      status: "collected",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // SEC-02
    {
      id: `doc-${Date.now()}-4`,
      sectionId: sections[1].id,
      documentCode: "AHR-CIV-DWG-0001",
      title: "Site Grading Plan — Phase 1",
      status: "collected",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `doc-${Date.now()}-5`,
      sectionId: sections[1].id,
      documentCode: "AHR-STR-CAL-0012",
      title: "Primary Steel Structure Calculation",
      status: "collected",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `doc-${Date.now()}-6`,
      sectionId: sections[1].id,
      documentCode: "AHR-MEC-SPC-0023",
      title: "Heat Exchanger Technical Specification",
      status: "pending",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `doc-${Date.now()}-7`,
      sectionId: sections[1].id,
      documentCode: "AHR-ELE-DWG-0045",
      title: "Main Substation Single Line Diagram",
      status: "missing",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `doc-${Date.now()}-8`,
      sectionId: sections[1].id,
      documentCode: "AHR-INS-DAT-0008",
      title: "Control Valve Datasheet — Unit 100",
      status: "collected",
      format: "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.insert(databookDocuments).values(documents);
  console.log(`✅ ${documents.length} databook documents created`);

  // Seed databook rules
  const rules = [
    {
      id: `rule-${Date.now()}-1`,
      projectId,
      pattern: "*-CIV-DWG-* with status IFC",
      sectionId: sections[1].id,
      trigger: "On approval",
      createdAt: new Date(),
    },
    {
      id: `rule-${Date.now()}-2`,
      projectId,
      pattern: "VND-* (any)",
      sectionId: sections[2].id,
      trigger: "On upload",
      createdAt: new Date(),
    },
    {
      id: `rule-${Date.now()}-3`,
      projectId,
      pattern: "ITR-* (any)",
      sectionId: sections[3].id,
      trigger: "On upload",
      createdAt: new Date(),
    },
    {
      id: `rule-${Date.now()}-4`,
      projectId,
      pattern: "MTC-* (any)",
      sectionId: sections[4].id,
      trigger: "On upload",
      createdAt: new Date(),
    },
    {
      id: `rule-${Date.now()}-5`,
      projectId,
      pattern: "AB-* (as-built)",
      sectionId: sections[6].id,
      trigger: "On tag",
      createdAt: new Date(),
    },
  ];

  await db.insert(databookRules).values(rules);
  console.log(`✅ ${rules.length} databook rules created`);

  // Seed databook metadata
  const metadata = {
    id: `meta-${Date.now()}`,
    projectId,
    title: "Al Hamra Refinery Expansion — Project Data Book",
    revision: "Rev 02",
    compiler: "S. Kumar",
    targetDate: "2026-12-31",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(databookMetadata).values(metadata);
  console.log("✅ Databook metadata created");

  console.log("✅ Schedule and databook seeding complete!");
}

seedScheduleAndDatabook()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
