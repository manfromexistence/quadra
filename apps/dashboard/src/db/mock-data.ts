// Mock data for dashboard development
// This file provides mock data to replace Turso database calls

import type { ThemeStyles } from "./schema";

// ============================================
// MOCK USERS
// ============================================

export const mockUsers = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    role: "admin",
    organization: "ACME Corp",
    jobTitle: "Project Manager",
    phone: "+1234567890",
    department: "Engineering",
    notificationPreferences: JSON.stringify({ email: true, push: true }),
    isActive: true,
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    role: "user",
    organization: "ACME Corp",
    jobTitle: "Developer",
    phone: "+1234567891",
    department: "Engineering",
    notificationPreferences: JSON.stringify({ email: true, push: false }),
    isActive: true,
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    role: "client",
    organization: "Client Co",
    jobTitle: "CEO",
    phone: "+1234567892",
    department: "Executive",
    notificationPreferences: JSON.stringify({ email: true, push: true }),
    isActive: true,
  },
];

// ============================================
// MOCK SESSIONS
// ============================================

export const mockSessions = [
  {
    id: "session_1",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    token: "mock_token_1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    userId: "user_1",
  },
];

// ============================================
// MOCK THEMES
// ============================================

const defaultThemeStyles: ThemeStyles = {
  light: {
    background: "#ffffff",
    foreground: "#000000",
    primary: "#0070f3",
    secondary: "#7928ca",
  },
  dark: {
    background: "#000000",
    foreground: "#ffffff",
    primary: "#0070f3",
    secondary: "#7928ca",
  },
};

export const mockThemes = [
  {
    id: "theme_1",
    userId: "user_1",
    name: "Default Theme",
    styles: defaultThemeStyles,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "theme_2",
    userId: "user_1",
    name: "Ocean Blue",
    styles: {
      light: {
        background: "#f0f9ff",
        foreground: "#0c4a6e",
        primary: "#0284c7",
        secondary: "#06b6d4",
      },
      dark: {
        background: "#0c4a6e",
        foreground: "#f0f9ff",
        primary: "#38bdf8",
        secondary: "#22d3ee",
      },
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
];

// ============================================
// MOCK SUBSCRIPTIONS
// ============================================

export const mockSubscriptions = [
  {
    id: "sub_1",
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date("2024-01-01"),
    amount: 2900,
    currency: "USD",
    recurringInterval: "month",
    status: "active",
    currentPeriodStart: new Date("2024-01-01"),
    currentPeriodEnd: new Date("2024-02-01"),
    cancelAtPeriodEnd: false,
    canceledAt: null,
    startedAt: new Date("2024-01-01"),
    endsAt: null,
    endedAt: null,
    customerId: "cus_1",
    productId: "prod_1",
    discountId: null,
    checkoutId: "checkout_1",
    customerCancellationReason: null,
    customerCancellationComment: null,
    metadata: null,
    customFieldData: null,
    userId: "user_1",
  },
];

// ============================================
// MOCK AI USAGE
// ============================================

export const mockAiUsage = [
  {
    id: "ai_usage_1",
    userId: "user_1",
    modelId: "gpt-4",
    promptTokens: "1500",
    completionTokens: "500",
    daysSinceEpoch: String(Math.floor(Date.now() / (1000 * 60 * 60 * 24))),
    createdAt: new Date(),
  },
  {
    id: "ai_usage_2",
    userId: "user_1",
    modelId: "gpt-4",
    promptTokens: "2000",
    completionTokens: "800",
    daysSinceEpoch: String(Math.floor(Date.now() / (1000 * 60 * 60 * 24)) - 1),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// ============================================
// MOCK OAUTH APPS
// ============================================

export const mockOauthApps = [
  {
    id: "oauth_app_1",
    name: "Test OAuth App",
    description: "A test OAuth application",
    clientId: "test_client_id",
    clientSecretHash: "hashed_secret",
    redirectUris: ["http://localhost:3000/callback"],
    scopes: ["read", "write"],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function findUserById(id: string) {
  return mockUsers.find((user) => user.id === id);
}

export function findUserByEmail(email: string) {
  return mockUsers.find((user) => user.email === email);
}

export function findSessionByToken(token: string) {
  return mockSessions.find((session) => session.token === token);
}

export function findThemesByUserId(userId: string) {
  return mockThemes.filter((theme) => theme.userId === userId);
}

export function findSubscriptionByUserId(userId: string) {
  return mockSubscriptions.find((sub) => sub.userId === userId);
}

export function findAiUsageByUserId(userId: string) {
  return mockAiUsage.filter((usage) => usage.userId === userId);
}

// ============================================
// MOCK PROJECTS
// ============================================

export const mockProjects = [
  {
    id: "proj_1",
    name: "Downtown Office Complex",
    description: "Modern 15-story office building in downtown area",
    projectNumber: "PRJ-2024-001",
    location: "123 Main St, Downtown",
    clientId: "user_3",
    status: "active",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2025-12-31"),
    images: JSON.stringify(["/images/project1.jpg"]),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    createdBy: "user_1",
  },
  {
    id: "proj_2",
    name: "Residential Tower",
    description: "Luxury residential tower with 200 units",
    projectNumber: "PRJ-2024-002",
    location: "456 Park Ave",
    clientId: "user_3",
    status: "active",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2026-06-30"),
    images: JSON.stringify(["/images/project2.jpg"]),
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    createdBy: "user_1",
  },
  {
    id: "proj_3",
    name: "Shopping Mall Renovation",
    description: "Complete renovation of existing shopping center",
    projectNumber: "PRJ-2024-003",
    location: "789 Commerce Blvd",
    clientId: "user_3",
    status: "planning",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2025-03-31"),
    images: null,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    createdBy: "user_1",
  },
];

// ============================================
// MOCK PROJECT MEMBERS
// ============================================

export const mockProjectMembers = [
  {
    id: "pm_1",
    projectId: "proj_1",
    userId: "user_1",
    role: "project_manager",
    permissions: JSON.stringify(["read", "write", "approve"]),
    assignedAt: new Date("2024-01-01"),
    assignedBy: "user_1",
  },
  {
    id: "pm_2",
    projectId: "proj_1",
    userId: "user_2",
    role: "engineer",
    permissions: JSON.stringify(["read", "write"]),
    assignedAt: new Date("2024-01-05"),
    assignedBy: "user_1",
  },
  {
    id: "pm_3",
    projectId: "proj_2",
    userId: "user_1",
    role: "project_manager",
    permissions: JSON.stringify(["read", "write", "approve"]),
    assignedAt: new Date("2024-02-01"),
    assignedBy: "user_1",
  },
];

// ============================================
// MOCK DOCUMENTS
// ============================================

export const mockDocuments = [
  {
    id: "doc_1",
    projectId: "proj_1",
    documentNumber: "DOC-001-2024",
    title: "Architectural Plans - Floor 1-5",
    description: "Detailed architectural drawings for floors 1 through 5",
    discipline: "Architecture",
    category: "Drawings",
    version: "2.0",
    revision: "B",
    isLatestVersion: true,
    fileName: "arch-plans-f1-5-v2.pdf",
    fileSize: 15728640,
    fileType: "application/pdf",
    fileUrl: "/files/doc_1.pdf",
    status: "approved",
    tags: JSON.stringify(["architecture", "floor-plans", "structural"]),
    customFields: null,
    images: JSON.stringify(["/thumbnails/doc_1.jpg"]),
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: "user_2",
    updatedAt: new Date("2024-02-01"),
    updatedBy: "user_2",
    approvedAt: new Date("2024-02-05"),
    approvedBy: "user_1",
    rejectedAt: null,
    rejectedBy: null,
  },
  {
    id: "doc_2",
    projectId: "proj_1",
    documentNumber: "DOC-002-2024",
    title: "Structural Engineering Report",
    description: "Structural analysis and load calculations",
    discipline: "Structural",
    category: "Reports",
    version: "1.0",
    revision: "A",
    isLatestVersion: true,
    fileName: "structural-report-v1.pdf",
    fileSize: 8388608,
    fileType: "application/pdf",
    fileUrl: "/files/doc_2.pdf",
    status: "under_review",
    tags: JSON.stringify(["structural", "engineering", "calculations"]),
    customFields: null,
    images: null,
    uploadedAt: new Date("2024-02-10"),
    uploadedBy: "user_2",
    updatedAt: new Date("2024-02-10"),
    updatedBy: "user_2",
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
  },
  {
    id: "doc_3",
    projectId: "proj_2",
    documentNumber: "DOC-003-2024",
    title: "MEP Specifications",
    description: "Mechanical, Electrical, and Plumbing specifications",
    discipline: "MEP",
    category: "Specifications",
    version: "1.0",
    revision: "A",
    isLatestVersion: true,
    fileName: "mep-specs-v1.pdf",
    fileSize: 5242880,
    fileType: "application/pdf",
    fileUrl: "/files/doc_3.pdf",
    status: "draft",
    tags: JSON.stringify(["mep", "specifications"]),
    customFields: null,
    images: null,
    uploadedAt: new Date("2024-02-20"),
    uploadedBy: "user_2",
    updatedAt: new Date("2024-02-20"),
    updatedBy: "user_2",
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
  },
];

// ============================================
// MOCK DOCUMENT VERSIONS
// ============================================

export const mockDocumentVersions = [
  {
    id: "dv_1",
    documentId: "doc_1",
    version: "1.0",
    fileName: "arch-plans-f1-5-v1.pdf",
    fileUrl: "/files/doc_1_v1.pdf",
    fileSize: 14680064,
    changeDescription: "Initial version",
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: "user_2",
  },
  {
    id: "dv_2",
    documentId: "doc_1",
    version: "2.0",
    fileName: "arch-plans-f1-5-v2.pdf",
    fileUrl: "/files/doc_1.pdf",
    fileSize: 15728640,
    changeDescription: "Updated based on client feedback",
    uploadedAt: new Date("2024-02-01"),
    uploadedBy: "user_2",
  },
];

// ============================================
// MOCK DOCUMENT COMMENTS
// ============================================

export const mockDocumentComments = [
  {
    id: "dc_1",
    documentId: "doc_1",
    userId: "user_1",
    comment: "Looks good, approved for construction",
    commentType: "approval",
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  },
  {
    id: "dc_2",
    documentId: "doc_2",
    userId: "user_1",
    comment: "Please review the load calculations on page 15",
    commentType: "review",
    createdAt: new Date("2024-02-12"),
    updatedAt: new Date("2024-02-12"),
  },
];

// ============================================
// MOCK NOTIFICATIONS
// ============================================

export const mockNotifications = [
  {
    id: "notif_1",
    userId: "user_1",
    type: "document_uploaded",
    title: "New Document Uploaded",
    message: "Jane Smith uploaded 'Structural Engineering Report'",
    projectId: "proj_1",
    documentId: "doc_2",
    relatedEntityType: "document",
    relatedEntityId: "doc_2",
    actionUrl: "/projects/proj_1/documents/doc_2",
    isRead: false,
    readAt: null,
    createdAt: new Date("2024-02-10"),
    emailSent: true,
    emailSentAt: new Date("2024-02-10"),
  },
  {
    id: "notif_2",
    userId: "user_2",
    type: "document_approved",
    title: "Document Approved",
    message: "John Doe approved 'Architectural Plans - Floor 1-5'",
    projectId: "proj_1",
    documentId: "doc_1",
    relatedEntityType: "document",
    relatedEntityId: "doc_1",
    actionUrl: "/projects/proj_1/documents/doc_1",
    isRead: true,
    readAt: new Date("2024-02-06"),
    createdAt: new Date("2024-02-05"),
    emailSent: true,
    emailSentAt: new Date("2024-02-05"),
  },
  {
    id: "notif_3",
    userId: "user_2",
    type: "comment_added",
    title: "New Comment on Document",
    message: "John Doe commented on 'Structural Engineering Report'",
    projectId: "proj_1",
    documentId: "doc_2",
    relatedEntityType: "comment",
    relatedEntityId: "dc_2",
    actionUrl: "/projects/proj_1/documents/doc_2#comments",
    isRead: false,
    readAt: null,
    createdAt: new Date("2024-02-12"),
    emailSent: true,
    emailSentAt: new Date("2024-02-12"),
  },
];

// ============================================
// MOCK ACTIVITY LOG
// ============================================

export const mockActivityLog = [
  {
    id: "act_1",
    userId: "user_1",
    projectId: "proj_1",
    action: "created",
    entityType: "project",
    entityId: "proj_1",
    entityName: "Downtown Office Complex",
    description: "Created new project",
    metadata: null,
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "act_2",
    userId: "user_2",
    projectId: "proj_1",
    action: "uploaded",
    entityType: "document",
    entityId: "doc_1",
    entityName: "Architectural Plans - Floor 1-5",
    description: "Uploaded new document",
    metadata: JSON.stringify({ fileSize: 15728640, version: "2.0" }),
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "act_3",
    userId: "user_1",
    projectId: "proj_1",
    action: "approved",
    entityType: "document",
    entityId: "doc_1",
    entityName: "Architectural Plans - Floor 1-5",
    description: "Approved document",
    metadata: null,
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date("2024-02-05"),
  },
];

// ============================================
// ADDITIONAL HELPER FUNCTIONS
// ============================================

export function findProjectById(id: string) {
  return mockProjects.find((project) => project.id === id);
}

export function findProjectsByClientId(clientId: string) {
  return mockProjects.filter((project) => project.clientId === clientId);
}

export function findDocumentsByProjectId(projectId: string) {
  return mockDocuments.filter((doc) => doc.projectId === projectId);
}

export function findDocumentById(id: string) {
  return mockDocuments.find((doc) => doc.id === id);
}

export function findNotificationsByUserId(userId: string) {
  return mockNotifications.filter((notif) => notif.userId === userId);
}

export function findUnreadNotificationsByUserId(userId: string) {
  return mockNotifications.filter(
    (notif) => notif.userId === userId && !notif.isRead,
  );
}

export function findActivityLogByProjectId(projectId: string) {
  return mockActivityLog.filter((log) => log.projectId === projectId);
}

export function findProjectMembersByProjectId(projectId: string) {
  return mockProjectMembers.filter((member) => member.projectId === projectId);
}

export function findDocumentVersionsByDocumentId(documentId: string) {
  return mockDocumentVersions.filter(
    (version) => version.documentId === documentId,
  );
}

export function findDocumentCommentsByDocumentId(documentId: string) {
  return mockDocumentComments.filter(
    (comment) => comment.documentId === documentId,
  );
}

// ============================================
// MOCK TRANSMITTALS
// ============================================

export const mockTransmittals = [
  {
    id: "trans_1",
    projectId: "proj_1",
    transmittalNumber: "TRN-2024-001",
    subject: "Architectural Drawings Package 1",
    description:
      "Transmitting architectural drawings for floors 1-5 for review",
    sentFrom: "user_1",
    sentTo: "user_3",
    ccTo: "user_2",
    status: "sent",
    createdAt: new Date("2024-02-01"),
    sentAt: new Date("2024-02-01"),
    acknowledgedAt: new Date("2024-02-03"),
    acknowledgedBy: "user_3",
    notes: "Please review and provide feedback by Feb 10",
    customFields: null,
    images: null,
  },
  {
    id: "trans_2",
    projectId: "proj_1",
    transmittalNumber: "TRN-2024-002",
    subject: "Structural Engineering Documents",
    description: "Structural calculations and reports for review",
    sentFrom: "user_2",
    sentTo: "user_1",
    ccTo: null,
    status: "draft",
    createdAt: new Date("2024-02-10"),
    sentAt: null,
    acknowledgedAt: null,
    acknowledgedBy: null,
    notes: null,
    customFields: null,
    images: null,
  },
];

// ============================================
// MOCK TRANSMITTAL DOCUMENTS
// ============================================

export const mockTransmittalDocuments = [
  {
    id: "td_1",
    transmittalId: "trans_1",
    documentId: "doc_1",
    remarks: "For review and approval",
    addedAt: new Date("2024-02-01"),
  },
  {
    id: "td_2",
    transmittalId: "trans_2",
    documentId: "doc_2",
    remarks: "For information",
    addedAt: new Date("2024-02-10"),
  },
];

// ============================================
// MOCK DOCUMENT WORKFLOWS
// ============================================

export const mockDocumentWorkflows = [
  {
    id: "wf_1",
    documentId: "doc_1",
    workflowName: "Standard Approval Workflow",
    currentStep: 3,
    totalSteps: 3,
    status: "completed",
    startedAt: new Date("2024-01-15"),
    completedAt: new Date("2024-02-05"),
    createdBy: "user_2",
  },
  {
    id: "wf_2",
    documentId: "doc_2",
    workflowName: "Engineering Review Workflow",
    currentStep: 2,
    totalSteps: 4,
    status: "in_progress",
    startedAt: new Date("2024-02-10"),
    completedAt: null,
    createdBy: "user_2",
  },
];

// ============================================
// MOCK WORKFLOW STEPS
// ============================================

export const mockWorkflowSteps = [
  {
    id: "ws_1",
    workflowId: "wf_1",
    stepNumber: 1,
    stepName: "Initial Review",
    assignedTo: "user_2",
    assignedRole: "engineer",
    status: "completed",
    action: "reviewed",
    approvalCode: 1,
    comments: "Document looks good",
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: new Date("2024-01-15"),
    completedAt: new Date("2024-01-20"),
    dueDate: new Date("2024-01-25"),
  },
  {
    id: "ws_2",
    workflowId: "wf_1",
    stepNumber: 2,
    stepName: "Technical Review",
    assignedTo: "user_2",
    assignedRole: "engineer",
    status: "completed",
    action: "approved",
    approvalCode: 1,
    comments: "Technical aspects verified",
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: new Date("2024-01-20"),
    completedAt: new Date("2024-01-30"),
    dueDate: new Date("2024-02-01"),
  },
  {
    id: "ws_3",
    workflowId: "wf_1",
    stepNumber: 3,
    stepName: "Final Approval",
    assignedTo: "user_1",
    assignedRole: "project_manager",
    status: "completed",
    action: "approved",
    approvalCode: 1,
    comments: "Approved for construction",
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: new Date("2024-01-30"),
    completedAt: new Date("2024-02-05"),
    dueDate: new Date("2024-02-10"),
  },
  {
    id: "ws_4",
    workflowId: "wf_2",
    stepNumber: 1,
    stepName: "Initial Review",
    assignedTo: "user_2",
    assignedRole: "engineer",
    status: "completed",
    action: "reviewed",
    approvalCode: 1,
    comments: "Initial review complete",
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: new Date("2024-02-10"),
    completedAt: new Date("2024-02-11"),
    dueDate: new Date("2024-02-15"),
  },
  {
    id: "ws_5",
    workflowId: "wf_2",
    stepNumber: 2,
    stepName: "Structural Analysis",
    assignedTo: "user_2",
    assignedRole: "engineer",
    status: "in_progress",
    action: null,
    approvalCode: null,
    comments: null,
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: new Date("2024-02-11"),
    completedAt: null,
    dueDate: new Date("2024-02-20"),
  },
  {
    id: "ws_6",
    workflowId: "wf_2",
    stepNumber: 3,
    stepName: "Manager Review",
    assignedTo: "user_1",
    assignedRole: "project_manager",
    status: "pending",
    action: null,
    approvalCode: null,
    comments: null,
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: null,
    completedAt: null,
    dueDate: new Date("2024-02-25"),
  },
  {
    id: "ws_7",
    workflowId: "wf_2",
    stepNumber: 4,
    stepName: "Final Approval",
    assignedTo: "user_1",
    assignedRole: "project_manager",
    status: "pending",
    action: null,
    approvalCode: null,
    comments: null,
    attachmentUrl: null,
    attachmentFileName: null,
    attachmentFileSize: null,
    startedAt: null,
    completedAt: null,
    dueDate: new Date("2024-03-01"),
  },
];

// ============================================
// ADDITIONAL HELPER FUNCTIONS FOR NEW TABLES
// ============================================

export function findTransmittalsByProjectId(projectId: string) {
  return mockTransmittals.filter((trans) => trans.projectId === projectId);
}

export function findTransmittalById(id: string) {
  return mockTransmittals.find((trans) => trans.id === id);
}

export function findTransmittalDocumentsByTransmittalId(transmittalId: string) {
  return mockTransmittalDocuments.filter(
    (td) => td.transmittalId === transmittalId,
  );
}

export function findDocumentWorkflowsByDocumentId(documentId: string) {
  return mockDocumentWorkflows.filter((wf) => wf.documentId === documentId);
}

export function findWorkflowStepsByWorkflowId(workflowId: string) {
  return mockWorkflowSteps.filter((step) => step.workflowId === workflowId);
}

// ============================================
// MOCK MIDDAY TABLES (Financial Management)
// ============================================

export const mockTeams = [
  {
    id: "team_1",
    name: "ACME Corp",
    email: "team@acme.com",
    logoUrl: null,
    inboxId: "inbox_1",
    inboxEmail: "inbox@acme.com",
    inboxForwarding: true,
    baseCurrency: "USD",
    documentClassification: true,
    plan: "pro",
    createdAt: new Date("2024-01-01"),
    canceledAt: null,
  },
];

export const mockBankAccounts = [
  {
    id: "bank_1",
    teamId: "team_1",
    name: "Business Checking",
    currency: "USD",
    balance: 125000.5,
    type: "checking",
    enabled: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "bank_2",
    teamId: "team_1",
    name: "Savings Account",
    currency: "USD",
    balance: 50000.0,
    type: "savings",
    enabled: true,
    createdAt: new Date("2024-01-01"),
  },
];

export const mockTransactions = [
  {
    id: "txn_1",
    teamId: "team_1",
    bankAccountId: "bank_1",
    name: "Office Supplies",
    amount: -450.0,
    currency: "USD",
    date: new Date("2024-02-01"),
    status: "completed",
    category: "office",
    method: "card",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "txn_2",
    teamId: "team_1",
    bankAccountId: "bank_1",
    name: "Client Payment - Project A",
    amount: 15000.0,
    currency: "USD",
    date: new Date("2024-02-05"),
    status: "completed",
    category: "income",
    method: "transfer",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "txn_3",
    teamId: "team_1",
    bankAccountId: "bank_1",
    name: "Software Subscription",
    amount: -299.0,
    currency: "USD",
    date: new Date("2024-02-10"),
    status: "completed",
    category: "software",
    method: "card",
    createdAt: new Date("2024-02-10"),
  },
];

export const mockCustomers = [
  {
    id: "cust_1",
    teamId: "team_1",
    name: "Client Co",
    email: "contact@clientco.com",
    phone: "+1234567890",
    address: "123 Business St",
    city: "New York",
    country: "USA",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "cust_2",
    teamId: "team_1",
    name: "Enterprise Inc",
    email: "billing@enterprise.com",
    phone: "+1234567891",
    address: "456 Corporate Ave",
    city: "San Francisco",
    country: "USA",
    createdAt: new Date("2024-01-20"),
  },
];

export const mockInvoices = [
  {
    id: "inv_1",
    teamId: "team_1",
    customerId: "cust_1",
    invoiceNumber: "INV-2024-001",
    issueDate: new Date("2024-02-01"),
    dueDate: new Date("2024-03-01"),
    amount: 15000.0,
    currency: "USD",
    status: "paid",
    paidAt: new Date("2024-02-05"),
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "inv_2",
    teamId: "team_1",
    customerId: "cust_2",
    invoiceNumber: "INV-2024-002",
    issueDate: new Date("2024-02-10"),
    dueDate: new Date("2024-03-10"),
    amount: 25000.0,
    currency: "USD",
    status: "sent",
    paidAt: null,
    createdAt: new Date("2024-02-10"),
  },
];

export const mockTrackerProjects = [
  {
    id: "track_proj_1",
    teamId: "team_1",
    name: "Website Redesign",
    description: "Complete website overhaul",
    status: "active",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "track_proj_2",
    teamId: "team_1",
    name: "Mobile App Development",
    description: "iOS and Android app",
    status: "active",
    createdAt: new Date("2024-02-01"),
  },
];

export const mockTrackerEntries = [
  {
    id: "track_1",
    teamId: "team_1",
    projectId: "track_proj_1",
    userId: "user_2",
    description: "Frontend development",
    start: new Date("2024-02-15T09:00:00"),
    stop: new Date("2024-02-15T12:00:00"),
    duration: 10800,
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "track_2",
    teamId: "team_1",
    projectId: "track_proj_1",
    userId: "user_2",
    description: "Backend API integration",
    start: new Date("2024-02-15T13:00:00"),
    stop: new Date("2024-02-15T17:00:00"),
    duration: 14400,
    createdAt: new Date("2024-02-15"),
  },
];

// ============================================
// HELPER FUNCTIONS FOR MIDDAY TABLES
// ============================================

export function findTeamById(id: string) {
  return mockTeams.find((team) => team.id === id);
}

export function findBankAccountsByTeamId(teamId: string) {
  return mockBankAccounts.filter((account) => account.teamId === teamId);
}

export function findTransactionsByTeamId(teamId: string) {
  return mockTransactions.filter((txn) => txn.teamId === teamId);
}

export function findCustomersByTeamId(teamId: string) {
  return mockCustomers.filter((customer) => customer.teamId === teamId);
}

export function findInvoicesByTeamId(teamId: string) {
  return mockInvoices.filter((invoice) => invoice.teamId === teamId);
}

export function findTrackerProjectsByTeamId(teamId: string) {
  return mockTrackerProjects.filter((project) => project.teamId === teamId);
}

export function findTrackerEntriesByProjectId(projectId: string) {
  return mockTrackerEntries.filter((entry) => entry.projectId === projectId);
}

export const mockVaultFiles = [
  {
    id: "vault_1",
    teamId: "team_1",
    name: "Contract_2024.pdf",
    path: "/vault/contracts/Contract_2024.pdf",
    size: 2048576,
    type: "application/pdf",
    createdAt: new Date("2024-01-15"),
    createdBy: "user_1",
  },
  {
    id: "vault_2",
    teamId: "team_1",
    name: "Invoice_Template.xlsx",
    path: "/vault/templates/Invoice_Template.xlsx",
    size: 524288,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    createdAt: new Date("2024-02-01"),
    createdBy: "user_1",
  },
];

export const mockInboxItems = [
  {
    id: "inbox_1",
    teamId: "team_1",
    displayName: "Receipt - Office Supplies",
    fileName: "receipt_001.pdf",
    filePath: "/inbox/receipt_001.pdf",
    amount: 450.0,
    currency: "USD",
    date: new Date("2024-02-01"),
    status: "pending",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "inbox_2",
    teamId: "team_1",
    displayName: "Invoice - Software License",
    fileName: "invoice_002.pdf",
    filePath: "/inbox/invoice_002.pdf",
    amount: 299.0,
    currency: "USD",
    date: new Date("2024-02-10"),
    status: "processed",
    createdAt: new Date("2024-02-10"),
  },
];

export function findVaultFilesByTeamId(teamId: string) {
  return mockVaultFiles.filter((file) => file.teamId === teamId);
}

export function findInboxItemsByTeamId(teamId: string) {
  return mockInboxItems.filter((item) => item.teamId === teamId);
}
