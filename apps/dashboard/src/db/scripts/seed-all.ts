import { db } from "../index";
import { user } from "../schema";
import {
  databookDocuments,
  databookMetadata,
  databookRules,
  databookSections,
} from "../schema/databook";
import { documents } from "../schema/documents";
import { bankAccounts, customers, teams, transactions } from "../schema/midday";
import { notifications } from "../schema/notifications";
import { projectMembers, projects } from "../schema/projects";
import { scheduleActivities, scheduleSync } from "../schema/schedule";
import { transmittalDocuments, transmittals } from "../schema/transmittals";
import { documentWorkflows, workflowSteps } from "../schema/workflows";

async function seedAll() {
  console.log("🌱 Seeding ALL database tables...");
  const now = new Date();

  // 1. Create test user
  const userId = "test-admin-001";
  await db
    .insert(user)
    .values({
      id: userId,
      name: "Admin User",
      email: "admin@quadra-edms.com",
      emailVerified: true,
      role: "admin",
      organization: "Quadra EDMS",
      jobTitle: "System Administrator",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();
  console.log("✅ User created");

  // 2. Create team
  const teamId = "team-001";
  await db
    .insert(teams)
    .values({
      id: teamId,
      name: "Quadra EDMS Team",
      email: "team@quadra-edms.com",
      baseCurrency: "USD",
      plan: "pro",
      createdAt: now,
    })
    .onConflictDoNothing();
  console.log("✅ Team created");

  // 3. Create bank accounts
  await db
    .insert(bankAccounts)
    .values([
      {
        id: "bank-001",
        teamId,
        name: "Main Operating Account",
        currency: "USD",
        balance: 150000.0,
        type: "checking",
        enabled: true,
        createdAt: now,
      },
      {
        id: "bank-002",
        teamId,
        name: "Project Reserve",
        currency: "USD",
        balance: 50000.0,
        type: "savings",
        enabled: true,
        createdAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Bank accounts created");

  // 4. Create transactions
  await db
    .insert(transactions)
    .values([
      {
        id: "txn-001",
        teamId,
        bankAccountId: "bank-001",
        name: "Project Payment - Al Hamra",
        amount: 25000.0,
        currency: "USD",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "completed",
        category: "income",
        method: "wire_transfer",
        createdAt: now,
      },
      {
        id: "txn-002",
        teamId,
        bankAccountId: "bank-001",
        name: "Software Licenses",
        amount: -1200.0,
        currency: "USD",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        category: "software",
        method: "credit_card",
        createdAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Transactions created");

  // 5. Create customers
  await db
    .insert(customers)
    .values([
      {
        id: "cust-001",
        teamId,
        name: "Gulf National Petroleum",
        email: "contracts@gnp.com",
        phone: "+966-11-234-5678",
        address: "Riyadh, Saudi Arabia",
        createdAt: now,
      },
      {
        id: "cust-002",
        teamId,
        name: "Metro Transit Authority",
        email: "procurement@metro.gov",
        phone: "+966-11-876-5432",
        address: "Central District",
        createdAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Customers created");

  // 6. Create projects
  await db
    .insert(projects)
    .values([
      {
        id: "PRJ-AHR-2026",
        name: "Al Hamra Refinery Expansion",
        projectNumber: "PRJ-AHR-2026",
        description:
          "Major refinery expansion project for Gulf National Petroleum",
        location: "Eastern Province",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: "PRJ-MET-2026",
        name: "Metro Line 3 Civil Works",
        projectNumber: "PRJ-MET-2026",
        description: "Underground tunneling and civil works for Metro Line 3",
        location: "Central District",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Projects created");

  // 7. Create project members
  await db
    .insert(projectMembers)
    .values([
      {
        id: "pm1",
        projectId: "PRJ-AHR-2026",
        userId: userId,
        role: "admin",
        assignedAt: now,
        assignedBy: userId,
      },
      {
        id: "pm2",
        projectId: "PRJ-MET-2026",
        userId: userId,
        role: "admin",
        assignedAt: now,
        assignedBy: userId,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Project members created");

  // 8. Create documents
  await db
    .insert(documents)
    .values([
      {
        id: "doc-1",
        projectId: "PRJ-AHR-2026",
        documentNumber: "AHR-CIV-DWG-0001",
        title: "Site Grading Plan — Phase 1",
        discipline: "Civil",
        category: "Drawing",
        version: "1.0",
        revision: "B",
        status: "under_review",
        fileName: "site-grading-revb.pdf",
        fileSize: 1048576,
        fileType: "application/pdf",
        fileUrl: "https://example.com/site-grading.pdf",
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
        uploadedAt: now,
      },
      {
        id: "doc-2",
        projectId: "PRJ-AHR-2026",
        documentNumber: "AHR-STR-CAL-0012",
        title: "Primary Steel Structure Calculation",
        discipline: "Structural",
        category: "Calculation",
        version: "1.0",
        revision: "0",
        status: "approved",
        fileName: "steel-calc.pdf",
        fileSize: 512000,
        fileType: "application/pdf",
        fileUrl: "https://example.com/steel-calc.pdf",
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
        uploadedAt: now,
      },
      {
        id: "doc-3",
        projectId: "PRJ-AHR-2026",
        documentNumber: "AHR-MEC-SPC-0023",
        title: "Heat Exchanger Technical Specification",
        discipline: "Mechanical",
        category: "Specification",
        version: "1.0",
        revision: "C",
        status: "submitted",
        fileName: "hex-spec.pdf",
        fileSize: 256000,
        fileType: "application/pdf",
        fileUrl: "https://example.com/hex-spec.pdf",
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
        uploadedAt: now,
      },
      {
        id: "doc-4",
        projectId: "PRJ-AHR-2026",
        documentNumber: "AHR-ELE-DWG-0045",
        title: "Main Substation Single Line Diagram",
        discipline: "Electrical",
        category: "Drawing",
        version: "1.0",
        revision: "A",
        status: "under_review",
        fileName: "substation-sld.pdf",
        fileSize: 2048000,
        fileType: "application/pdf",
        fileUrl: "https://example.com/sld.pdf",
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
        uploadedAt: now,
      },
      {
        id: "doc-5",
        projectId: "PRJ-AHR-2026",
        documentNumber: "AHR-INS-DAT-0008",
        title: "Control Valve Datasheet — Unit 100",
        discipline: "Instrumentation",
        category: "Datasheet",
        version: "1.0",
        revision: "1",
        status: "approved",
        fileName: "valve-ds.pdf",
        fileSize: 128000,
        fileType: "application/pdf",
        fileUrl: "https://example.com/valve-ds.pdf",
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
        uploadedAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Documents created");

  // 9. Create workflows
  await db
    .insert(documentWorkflows)
    .values([
      {
        id: "wf-1",
        projectId: "PRJ-AHR-2026",
        documentId: "doc-1",
        workflowName: "Standard Review",
        totalSteps: 1,
        status: "in_progress",
        currentStepIndex: 1,
        initiatorId: userId,
        startedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "wf-2",
        projectId: "PRJ-AHR-2026",
        documentId: "doc-4",
        workflowName: "Client Approval",
        totalSteps: 1,
        status: "in_progress",
        currentStepIndex: 1,
        initiatorId: userId,
        startedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(workflowSteps)
    .values([
      {
        id: "wf-step-1",
        workflowId: "wf-1",
        stepName: "Discipline Lead Review",
        stepNumber: 1,
        assignedRole: "reviewer",
        assignedTo: userId,
        status: "pending",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "wf-step-2",
        workflowId: "wf-2",
        stepName: "Client Approval",
        stepNumber: 1,
        assignedRole: "approver",
        assignedTo: userId,
        status: "pending",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Workflows created");

  // 10. Create transmittals
  await db
    .insert(transmittals)
    .values([
      {
        id: "tm-1",
        projectId: "PRJ-AHR-2026",
        transmittalNumber: "TM-AHR-0042",
        subject: "IFC Drawings for Substation",
        purpose: "IFC",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        description:
          "Please find attached the approved for construction drawings.",
        status: "sent",
        sentFrom: userId,
        sentTo: JSON.stringify([userId]),
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: now,
      },
      {
        id: "tm-2",
        projectId: "PRJ-AHR-2026",
        transmittalNumber: "TM-AHR-0041",
        subject: "IFR Instrumentation Datasheets",
        purpose: "IFR",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: "Please review the attached datasheets.",
        status: "sent",
        sentFrom: userId,
        sentTo: JSON.stringify([userId]),
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: now,
      },
      {
        id: "tm-3",
        projectId: "PRJ-AHR-2026",
        transmittalNumber: "TM-AHR-0040",
        subject: "IFA Structural Calculations Package",
        purpose: "IFA",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        description: "Please approve the structural calculations.",
        status: "acknowledged",
        sentFrom: userId,
        sentTo: JSON.stringify([userId]),
        sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        acknowledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        acknowledgedBy: userId,
        createdAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(transmittalDocuments)
    .values([
      {
        id: "tm-doc-1",
        transmittalId: "tm-1",
        documentId: "doc-4",
        addedAt: now,
      },
      {
        id: "tm-doc-2",
        transmittalId: "tm-1",
        documentId: "doc-1",
        addedAt: now,
      },
      {
        id: "tm-doc-3",
        transmittalId: "tm-2",
        documentId: "doc-5",
        addedAt: now,
      },
      {
        id: "tm-doc-4",
        transmittalId: "tm-3",
        documentId: "doc-2",
        addedAt: now,
      },
      {
        id: "tm-doc-5",
        transmittalId: "tm-3",
        documentId: "doc-3",
        addedAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Transmittals created");

  // 11. Create notifications
  await db
    .insert(notifications)
    .values([
      {
        id: "notif-1",
        userId: userId,
        type: "workflow_assigned",
        title: "Review Overdue",
        message:
          "Client Approval for Main Substation Single Line Diagram is overdue.",
        projectId: "PRJ-AHR-2026",
        documentId: "doc-4",
        relatedEntityType: "workflow_step",
        relatedEntityId: "wf-step-2",
        actionUrl: "/workflows",
        isRead: false,
        createdAt: now,
      },
      {
        id: "notif-2",
        userId: userId,
        type: "transmittal_received",
        title: "New Transmittal Received",
        message: "You received TM-AHR-0042: IFC Drawings for Substation.",
        projectId: "PRJ-AHR-2026",
        documentId: null,
        relatedEntityType: "transmittal",
        relatedEntityId: "tm-1",
        actionUrl: "/transmittals",
        isRead: false,
        createdAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Notifications created");

  // 12. Create schedule data
  const syncId = `sync-${Date.now()}`;
  await db
    .insert(scheduleSync)
    .values({
      id: syncId,
      projectId: "PRJ-AHR-2026",
      source: "Primavera P6",
      lastSyncAt: new Date("2026-04-16T08:30:00"),
      syncedBy: "S. Kumar",
      projectStart: "2026-01-01",
      projectEnd: "2026-12-31",
      createdAt: now,
    })
    .onConflictDoNothing();

  const activities = [
    {
      id: `act-${Date.now()}-1`,
      projectId: "PRJ-AHR-2026",
      activityCode: "ACT-001",
      name: "Detailed Engineering — Civil Works",
      wbs: "1.2.1",
      phase: "engineering",
      startDate: "2026-01-15",
      endDate: "2026-05-30",
      plannedProgress: 65,
      actualProgress: 68,
      linkedDocuments: JSON.stringify(["AHR-CIV-DWG-0001", "AHR-CIV-CAL-0012"]),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `act-${Date.now()}-2`,
      projectId: "PRJ-AHR-2026",
      activityCode: "ACT-002",
      name: "Equipment Procurement — Heat Exchangers",
      wbs: "2.1.3",
      phase: "procurement",
      startDate: "2026-03-01",
      endDate: "2026-08-15",
      plannedProgress: 42,
      actualProgress: 38,
      linkedDocuments: JSON.stringify(["AHR-MEC-SPC-0023"]),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `act-${Date.now()}-3`,
      projectId: "PRJ-AHR-2026",
      activityCode: "ACT-003",
      name: "Foundation Construction — Unit 100",
      wbs: "3.1.1",
      phase: "construction",
      startDate: "2026-04-01",
      endDate: "2026-09-30",
      plannedProgress: 28,
      actualProgress: 25,
      linkedDocuments: JSON.stringify([]),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `act-${Date.now()}-4`,
      projectId: "PRJ-AHR-2026",
      activityCode: "ACT-004",
      name: "Electrical Installation — Substation",
      wbs: "3.2.4",
      phase: "construction",
      startDate: "2026-06-01",
      endDate: "2026-11-15",
      plannedProgress: 15,
      actualProgress: 18,
      linkedDocuments: JSON.stringify(["AHR-ELE-DWG-0045"]),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `act-${Date.now()}-5`,
      projectId: "PRJ-AHR-2026",
      activityCode: "ACT-005",
      name: "Pre-Commissioning — Control Systems",
      wbs: "4.1.2",
      phase: "commissioning",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
      plannedProgress: 8,
      actualProgress: 5,
      linkedDocuments: JSON.stringify(["AHR-INS-DAT-0008"]),
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(scheduleActivities).values(activities).onConflictDoNothing();
  console.log("✅ Schedule data created");

  // 13. Create databook data
  const sections = [
    {
      id: `sec-${Date.now()}-1`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-01",
      title: "Project Management & Contracts",
      requiredCount: 12,
      collectedCount: 12,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec-${Date.now()}-2`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-02",
      title: "Engineering Design Documentation",
      requiredCount: 45,
      collectedCount: 38,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec-${Date.now()}-3`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-03",
      title: "Vendor Documentation & Data Sheets",
      requiredCount: 28,
      collectedCount: 22,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec-${Date.now()}-4`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-04",
      title: "Inspection & Test Records",
      requiredCount: 34,
      collectedCount: 18,
      sortOrder: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec-${Date.now()}-5`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-05",
      title: "Material Certificates & Mill Test Reports",
      requiredCount: 56,
      collectedCount: 42,
      sortOrder: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec-${Date.now()}-6`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-06",
      title: "Commissioning & Startup Documentation",
      requiredCount: 22,
      collectedCount: 8,
      sortOrder: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec-${Date.now()}-7`,
      projectId: "PRJ-AHR-2026",
      code: "SEC-07",
      title: "As-Built Drawings & Red-Line Markups",
      requiredCount: 38,
      collectedCount: 15,
      sortOrder: 7,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(databookSections).values(sections).onConflictDoNothing();

  const databookDocs = [
    {
      id: `dbdoc-${Date.now()}-1`,
      sectionId: sections[0].id,
      documentCode: "PMC-001",
      title: "Project Execution Plan",
      status: "collected",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-2`,
      sectionId: sections[0].id,
      documentCode: "PMC-002",
      title: "Quality Management Plan",
      status: "collected",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-3`,
      sectionId: sections[0].id,
      documentCode: "PMC-003",
      title: "HSE Management Plan",
      status: "collected",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-4`,
      sectionId: sections[1].id,
      documentCode: "AHR-CIV-DWG-0001",
      title: "Site Grading Plan — Phase 1",
      status: "collected",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-5`,
      sectionId: sections[1].id,
      documentCode: "AHR-STR-CAL-0012",
      title: "Primary Steel Structure Calculation",
      status: "collected",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-6`,
      sectionId: sections[1].id,
      documentCode: "AHR-MEC-SPC-0023",
      title: "Heat Exchanger Technical Specification",
      status: "pending",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-7`,
      sectionId: sections[1].id,
      documentCode: "AHR-ELE-DWG-0045",
      title: "Main Substation Single Line Diagram",
      status: "missing",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `dbdoc-${Date.now()}-8`,
      sectionId: sections[1].id,
      documentCode: "AHR-INS-DAT-0008",
      title: "Control Valve Datasheet — Unit 100",
      status: "collected",
      format: "PDF",
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(databookDocuments).values(databookDocs).onConflictDoNothing();

  const rules = [
    {
      id: `rule-${Date.now()}-1`,
      projectId: "PRJ-AHR-2026",
      pattern: "*-CIV-DWG-* with status IFC",
      sectionId: sections[1].id,
      trigger: "On approval",
      createdAt: now,
    },
    {
      id: `rule-${Date.now()}-2`,
      projectId: "PRJ-AHR-2026",
      pattern: "VND-* (any)",
      sectionId: sections[2].id,
      trigger: "On upload",
      createdAt: now,
    },
    {
      id: `rule-${Date.now()}-3`,
      projectId: "PRJ-AHR-2026",
      pattern: "ITR-* (any)",
      sectionId: sections[3].id,
      trigger: "On upload",
      createdAt: now,
    },
    {
      id: `rule-${Date.now()}-4`,
      projectId: "PRJ-AHR-2026",
      pattern: "MTC-* (any)",
      sectionId: sections[4].id,
      trigger: "On upload",
      createdAt: now,
    },
    {
      id: `rule-${Date.now()}-5`,
      projectId: "PRJ-AHR-2026",
      pattern: "AB-* (as-built)",
      sectionId: sections[6].id,
      trigger: "On tag",
      createdAt: now,
    },
  ];

  await db.insert(databookRules).values(rules).onConflictDoNothing();

  const metadata = {
    id: `meta-${Date.now()}`,
    projectId: "PRJ-AHR-2026",
    title: "Al Hamra Refinery Expansion — Project Data Book",
    revision: "Rev 02",
    compiler: "S. Kumar",
    targetDate: "2026-12-31",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(databookMetadata).values(metadata).onConflictDoNothing();
  console.log("✅ Databook data created");

  console.log("\n✅ ALL DATABASE TABLES SEEDED SUCCESSFULLY!");
  console.log("\n📊 Summary:");
  console.log("  - 1 user");
  console.log("  - 1 team");
  console.log("  - 2 bank accounts");
  console.log("  - 2 transactions");
  console.log("  - 2 customers");
  console.log("  - 2 projects");
  console.log("  - 2 project members");
  console.log("  - 5 documents");
  console.log("  - 2 workflows with 2 steps");
  console.log("  - 3 transmittals with 5 document links");
  console.log("  - 2 notifications");
  console.log("  - 5 schedule activities");
  console.log("  - 7 databook sections with 8 documents");
  console.log("  - 5 databook rules");
  console.log("  - 1 databook metadata");

  // Seed Incoming Transmittals
  const { incomingTransmittals, incomingTransmittalDocuments } = await import(
    "../schema/incoming-transmittals"
  );

  await db
    .insert(incomingTransmittals)
    .values([
      {
        id: "in-tm-001",
        transmittalNumber: "TM-IN-CLT-0089",
        date: new Date("2026-04-17"),
        receivedDate: new Date("2026-04-17"),
        from: "CLT",
        fromOrg: "Gulf National Petroleum",
        subject: "Design Basis Document Rev C — Approved with Comments",
        purpose: "IFC",
        theirRef: "GNPC/AHR/ENG/0124",
        responseRequired: true,
        responseDue: new Date("2026-04-27"),
        responseStatus: "Pending",
        assignedTo: userId,
        priority: "High",
        attachments: 3,
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "in-tm-002",
        transmittalNumber: "TM-IN-VND-0034",
        date: new Date("2026-04-16"),
        receivedDate: new Date("2026-04-16"),
        from: "VND",
        fromOrg: "Siemens Energy",
        subject: "Transformer Technical Submittals — Package 1",
        purpose: "IFR",
        theirRef: "SE/AHR/SUB/TR-01/001",
        responseRequired: true,
        responseDue: new Date("2026-04-30"),
        responseStatus: "In Progress",
        assignedTo: userId,
        priority: "High",
        attachments: 5,
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(incomingTransmittalDocuments)
    .values([
      {
        id: "in-tm-doc-001",
        transmittalId: "in-tm-001",
        documentCode: "AHR-PRO-RPT-0001",
        title: "Design Basis Document",
        revision: "C",
        status: "Approved with Comments",
        ourAction: "Review comments and update",
        createdAt: now,
      },
      {
        id: "in-tm-doc-002",
        transmittalId: "in-tm-002",
        documentCode: "AHR-ELE-DAT-0012",
        title: "Transformer Datasheet",
        revision: "A",
        status: "For Review",
        ourAction: "Technical review required",
        createdAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Incoming transmittals seeded");

  // Seed Technical Queries
  const { technicalQueries, siteTechQueries, rfis } = await import(
    "../schema/queries"
  );

  await db
    .insert(technicalQueries)
    .values([
      {
        id: "tq-001",
        queryNumber: "TQ-AHR-0012",
        date: new Date("2026-04-10"),
        raisedBy: userId,
        discipline: "STR",
        subject: "Foundation Design Clarification — Column C-24",
        description:
          "Require clarification on foundation depth for column C-24 due to soil conditions",
        status: "Open",
        priority: "High",
        assignedTo: "CLT",
        dueDate: new Date("2026-04-20"),
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "tq-002",
        queryNumber: "TQ-AHR-0011",
        date: new Date("2026-04-08"),
        raisedBy: userId,
        discipline: "MEC",
        subject: "Heat Exchanger Material Specification",
        description:
          "Clarification needed on material grade for heat exchanger tubes",
        status: "Responded",
        priority: "Medium",
        assignedTo: "CLT",
        dueDate: new Date("2026-04-18"),
        responseDate: new Date("2026-04-15"),
        response: "Use 316L stainless steel as per specification section 5.2",
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(siteTechQueries)
    .values([
      {
        id: "stq-001",
        queryNumber: "STQ-AHR-0005",
        date: new Date("2026-04-12"),
        raisedBy: "Site Team",
        discipline: "CIV",
        subject: "Concrete Pour Sequence — Grid A-B",
        description: "Clarification on concrete pour sequence for foundation",
        location: "Grid A-B, Foundation Level",
        status: "Open",
        priority: "High",
        assignedTo: userId,
        dueDate: new Date("2026-04-19"),
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(rfis)
    .values([
      {
        id: "rfi-001",
        rfiNumber: "RFI-AHR-0008",
        date: new Date("2026-04-14"),
        raisedBy: "Construction Team",
        from: "SUB",
        subject: "Piping Support Details — Area 100",
        description:
          "Request details for pipe support installation in Area 100",
        category: "Design",
        status: "Under Review",
        priority: "Medium",
        assignedTo: userId,
        dueDate: new Date("2026-04-24"),
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Queries and RFIs seeded");

  // Seed Correspondence
  const { letters, memos, minutesOfMeeting, momAttendees, momActionItems } =
    await import("../schema/correspondence");

  await db
    .insert(letters)
    .values([
      {
        id: "letter-001",
        letterNumber: "LTR-AHR-OUT-0042",
        date: new Date("2026-04-15"),
        direction: "Outgoing",
        from: "Quadra EDMS",
        to: "Gulf National Petroleum",
        toType: "Client",
        subject: "Monthly Progress Report — March 2026",
        category: "Progress Report",
        ref: "GNPC/AHR/2026/042",
        author: userId,
        attachments: 2,
        status: "Sent",
        urgent: false,
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "letter-002",
        letterNumber: "LTR-AHR-IN-0028",
        date: new Date("2026-04-10"),
        direction: "Incoming",
        from: "Gulf National Petroleum",
        to: "Quadra EDMS",
        toType: "Client",
        subject: "Approval of Procurement Package 3",
        category: "Approval",
        ref: "GNPC/AHR/APP/0028",
        author: userId,
        attachments: 1,
        status: "Received",
        urgent: true,
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(memos)
    .values([
      {
        id: "memo-001",
        memoNumber: "MEM-AHR-0015",
        date: new Date("2026-04-16"),
        from: "Project Manager",
        to: "All Engineering Team",
        subject: "Design Review Meeting — Week 16",
        category: "Internal",
        content:
          "Design review meeting scheduled for April 20, 2026 at 10:00 AM. All discipline leads must attend.",
        urgent: false,
        status: "Distributed",
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(minutesOfMeeting)
    .values([
      {
        id: "mom-001",
        momNumber: "MOM-AHR-0012",
        meetingDate: new Date("2026-04-10"),
        issuedDate: new Date("2026-04-11"),
        meetingType: "Weekly Progress",
        title: "Weekly Progress Meeting — Week 15",
        location: "Project Office, Conference Room A",
        chairperson: "John Smith",
        minuteTaker: userId,
        agenda: JSON.stringify([
          "Review of previous action items",
          "Engineering progress update",
          "Procurement status",
          "Construction activities",
        ]),
        decisions: JSON.stringify([
          "Approved design change for foundation depth",
          "Extended deadline for procurement package 4",
        ]),
        nextMeeting: new Date("2026-04-17"),
        status: "Issued",
        distribution: JSON.stringify(["CLT", "SUP", "EPC"]),
        projectId: "PRJ-AHR-2026",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(momAttendees)
    .values([
      {
        id: "attendee-001",
        momId: "mom-001",
        name: "John Smith",
        organization: "Quadra EDMS",
        role: "Project Manager",
        createdAt: now,
      },
      {
        id: "attendee-002",
        momId: "mom-001",
        name: "Sarah Johnson",
        organization: "Gulf National Petroleum",
        role: "Client Representative",
        createdAt: now,
      },
      {
        id: "attendee-003",
        momId: "mom-001",
        name: "Ahmed Al-Rashid",
        organization: "KBR Supervision",
        role: "Lead Engineer",
        createdAt: now,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(momActionItems)
    .values([
      {
        id: "action-001",
        momId: "mom-001",
        item: "Submit revised foundation drawings",
        assignedTo: "Engineering Team",
        dueDate: new Date("2026-04-20"),
        status: "Open",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "action-002",
        momId: "mom-001",
        item: "Finalize procurement package 4",
        assignedTo: "Procurement Team",
        dueDate: new Date("2026-04-25"),
        status: "In Progress",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Correspondence seeded");

  console.log("🎉 All database tables seeded successfully!");
}

seedAll()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
