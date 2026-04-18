import { db } from "../index";
import { projects, projectMembers } from "../schema/projects";
import { documents } from "../schema/documents";
import { documentWorkflows, workflowSteps } from "../schema/workflows";
import { transmittals } from "../schema/transmittals";
import { notifications } from "../schema/notifications";

async function main() {
  console.log("Seeding EDMS data...");
  const userId = "test-admin-001";
  const now = new Date();

  // 1. Projects
  await db.insert(projects).values([
    {
      id: "PRJ-AHR-2026",
      name: "Al Hamra Refinery Expansion",
      projectNumber: "PRJ-AHR-2026",
      description: "Major refinery expansion project for Gulf National Petroleum",
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
    }
  ]).onConflictDoNothing();

  // 2. Project Members
  await db.insert(projectMembers).values([
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
    }
  ]).onConflictDoNothing();

  // 3. Documents
  await db.insert(documents).values([
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
      createdBy: userId,
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
      createdBy: userId,
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
      createdBy: userId,
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
      createdBy: userId,
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
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      uploadedAt: now,
    }
  ]).onConflictDoNothing();

  // 4. Workflows
  await db.insert(documentWorkflows).values([
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
    }
  ]).onConflictDoNothing();

  await db.insert(workflowSteps).values([
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
    }
  ]).onConflictDoNothing();

  // 5. Transmittals
  await db.insert(transmittals).values([
    {
      id: "tm-1",
      projectId: "PRJ-AHR-2026",
      transmittalNumber: "TM-AHR-0042",
      subject: "IFC Drawings for Substation",
      purpose: "IFC",
      message: "Please find attached the approved for construction drawings.",
      status: "sent",
      senderId: userId,
      sentTo: userId,
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tm-2",
      projectId: "PRJ-AHR-2026",
      transmittalNumber: "TM-AHR-0041",
      subject: "IFR Instrumentation Datasheets",
      purpose: "IFR",
      message: "Please review the attached datasheets.",
      status: "sent",
      senderId: userId,
      sentTo: userId,
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    }
  ]).onConflictDoNothing();

  // 6. Notifications
  await db.insert(notifications).values([
    {
      id: "notif-1",
      userId: userId,
      type: "workflow_assigned",
      title: "Review Overdue",
      message: "Client Approval for Main Substation Single Line Diagram is overdue.",
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
    }
  ]).onConflictDoNothing();
  
  console.log("Done!");
}

main().catch(console.error);
