import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  disciplines,
  documentTypes,
  projectConfig,
  stakeholders,
  workflowStepTemplates,
} from "@/db/schema";

const DEFAULT_DISCIPLINES = [
  { code: "ARC", name: "Architecture", color: "#3b82f6", sortOrder: 1 },
  { code: "STR", name: "Structural", color: "#ef4444", sortOrder: 2 },
  { code: "MEC", name: "Mechanical", color: "#10b981", sortOrder: 3 },
  { code: "ELE", name: "Electrical", color: "#f59e0b", sortOrder: 4 },
  { code: "PLU", name: "Plumbing", color: "#06b6d4", sortOrder: 5 },
  { code: "FPS", name: "Fire Protection", color: "#dc2626", sortOrder: 6 },
  { code: "LAN", name: "Landscape", color: "#22c55e", sortOrder: 7 },
  { code: "INT", name: "Interior Design", color: "#a855f7", sortOrder: 8 },
];

const DEFAULT_DOCUMENT_TYPES = [
  { code: "DWG", name: "Drawing", sortOrder: 1 },
  { code: "SPE", name: "Specification", sortOrder: 2 },
  { code: "REP", name: "Report", sortOrder: 3 },
  { code: "CAL", name: "Calculation", sortOrder: 4 },
  { code: "SCH", name: "Schedule", sortOrder: 5 },
  { code: "MAN", name: "Manual", sortOrder: 6 },
  { code: "CER", name: "Certificate", sortOrder: 7 },
  { code: "COR", name: "Correspondence", sortOrder: 8 },
];

const DEFAULT_STAKEHOLDERS = [
  {
    stakeholderId: "CLI-001",
    name: "Client Project Management",
    role: "Client",
    contact: "pm@client.com",
    sortOrder: 1,
  },
  {
    stakeholderId: "PMC-001",
    name: "Project Management Consultant",
    role: "PMC",
    contact: "lead@pmc.com",
    sortOrder: 2,
  },
  {
    stakeholderId: "CON-001",
    name: "Main Contractor",
    role: "Contractor",
    contact: "pm@contractor.com",
    sortOrder: 3,
  },
  {
    stakeholderId: "DES-001",
    name: "Design Consultant",
    role: "Designer",
    contact: "lead@designer.com",
    sortOrder: 4,
  },
  {
    stakeholderId: "SUB-001",
    name: "MEP Subcontractor",
    role: "Subcontractor",
    contact: "coord@mep-sub.com",
    sortOrder: 5,
  },
  {
    stakeholderId: "AUT-001",
    name: "Local Authority",
    role: "Authority",
    contact: "approvals@authority.gov",
    sortOrder: 6,
  },
];

const DEFAULT_WORKFLOW_STEPS = [
  {
    stepName: "Internal Review",
    actor: "Design Lead",
    duration: "3 days",
    sortOrder: 1,
  },
  {
    stepName: "QA/QC Check",
    actor: "QA Manager",
    duration: "2 days",
    sortOrder: 2,
  },
  {
    stepName: "Client Review",
    actor: "Client PM",
    duration: "10 days",
    sortOrder: 3,
  },
  {
    stepName: "PMC Review",
    actor: "PMC Lead",
    duration: "7 days",
    sortOrder: 4,
  },
  {
    stepName: "Authority Approval",
    actor: "Local Authority",
    duration: "14 days",
    sortOrder: 5,
  },
  {
    stepName: "Final Approval",
    actor: "Project Director",
    duration: "2 days",
    sortOrder: 6,
  },
];

export async function seedProjectConfig(projectId: string, userId: string) {
  const now = new Date();

  try {
    // Create default project configuration
    await db.insert(projectConfig).values({
      id: nanoid(),
      projectId,
      projectCode: "PRJ-001",
      shortCode: "PRJ",
      client: null,
      contractor: null,
      currency: "usd",
      numberingPattern: "PRJ-DISC-TYPE-SEQ",
      sequencePadding: 4,
      separator: "hyphen",
      revisionScheme: "alpha-numeric",
      sequenceReset: "continuous",
      defaultReviewSla: "10 working days",
      reminderBeforeDue: 3,
      overdueEscalation: "pm",
      autoCloseAfter: "30 days of inactivity",
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    });

    // Create default disciplines
    const disciplineValues = DEFAULT_DISCIPLINES.map((discipline) => ({
      id: nanoid(),
      projectId,
      ...discipline,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(disciplines).values(disciplineValues);

    // Create default document types
    const docTypeValues = DEFAULT_DOCUMENT_TYPES.map((docType) => ({
      id: nanoid(),
      projectId,
      ...docType,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(documentTypes).values(docTypeValues);

    // Create default stakeholders
    const stakeholderValues = DEFAULT_STAKEHOLDERS.map((stakeholder) => ({
      id: nanoid(),
      projectId,
      ...stakeholder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(stakeholders).values(stakeholderValues);

    // Create default workflow steps
    const workflowValues = DEFAULT_WORKFLOW_STEPS.map((step) => ({
      id: nanoid(),
      projectId,
      ...step,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(workflowStepTemplates).values(workflowValues);

    console.log(`✅ Seeded project configuration for project ${projectId}`);
  } catch (error) {
    console.error(`❌ Error seeding project configuration:`, error);
    throw error;
  }
}

// Run this script directly
if (import.meta.main) {
  const projectId = process.argv[2];
  const userId = process.argv[3];

  if (!projectId || !userId) {
    console.error("Usage: bun run seed-project-config.ts <projectId> <userId>");
    process.exit(1);
  }

  await seedProjectConfig(projectId, userId);
  process.exit(0);
}
