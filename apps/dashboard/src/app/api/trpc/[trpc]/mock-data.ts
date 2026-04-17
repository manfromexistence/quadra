// Comprehensive mock data for Quadra Dashboard
// This provides realistic sample data for all 11 non-EDMS pages

// ============================================================================
// REPORTS (Financial analytics)
// ============================================================================

export const mockRevenue = {
  result: [
    {
      date: "2026-01",
      current: { value: 45000, date: "2026-01-01" },
      previous: { value: 38000, date: "2025-01-01" }
    },
    {
      date: "2026-02",
      current: { value: 52000, date: "2026-02-01" },
      previous: { value: 41000, date: "2025-02-01" }
    },
    {
      date: "2026-03",
      current: { value: 48000, date: "2026-03-01" },
      previous: { value: 42000, date: "2025-03-01" }
    },
    {
      date: "2026-04",
      current: { value: 61000, date: "2026-04-01" },
      previous: { value: 45000, date: "2025-04-01" }
    }
  ],
  summary: {
    currentTotal: 206000,
    previousTotal: 166000,
    currency: "USD"
  }
};

export const mockProfit = {
  result: [
    {
      date: "2026-01",
      current: { value: 15000, date: "2026-01-01" },
      previous: { value: 12000, date: "2025-01-01" }
    },
    {
      date: "2026-02",
      current: { value: 18000, date: "2026-02-01" },
      previous: { value: 14000, date: "2025-02-01" }
    },
    {
      date: "2026-03",
      current: { value: 16000, date: "2026-03-01" },
      previous: { value: 13500, date: "2025-03-01" }
    },
    {
      date: "2026-04",
      current: { value: 24000, date: "2026-04-01" },
      previous: { value: 16000, date: "2025-04-01" }
    }
  ],
  summary: {
    currentTotal: 73000,
    previousTotal: 55500,
    currency: "USD"
  }
};

export const mockExpenses = {
  result: [
    {
      date: "2026-01",
      recurring: 15000,
      total: 30000,
      categories: [
        { name: "Software", value: 5000, recurring: 5000 },
        { name: "Payroll", value: 20000, recurring: 10000 },
        { name: "Office", value: 5000, recurring: 0 }
      ]
    },
    {
      date: "2026-02",
      recurring: 15000,
      total: 34000,
      categories: [
        { name: "Software", value: 5000, recurring: 5000 },
        { name: "Payroll", value: 20000, recurring: 10000 },
        { name: "Travel", value: 9000, recurring: 0 }
      ]
    },
    {
      date: "2026-03",
      recurring: 15500,
      total: 32000,
      categories: [
        { name: "Software", value: 5500, recurring: 5500 },
        { name: "Payroll", value: 20000, recurring: 10000 },
        { name: "Marketing", value: 6500, recurring: 0 }
      ]
    },
    {
      date: "2026-04",
      recurring: 15500,
      total: 37000,
      categories: [
        { name: "Software", value: 5500, recurring: 5500 },
        { name: "Payroll", value: 20000, recurring: 10000 },
        { name: "Equipment", value: 11500, recurring: 0 }
      ]
    }
  ],
  summary: {
    total: 133000,
    averageExpense: 33250,
    currency: "USD"
  }
};

export const mockBurnRate = [
  { date: "2026-01", value: 28000, currency: "USD" },
  { date: "2026-02", value: 29500, currency: "USD" },
  { date: "2026-03", value: 31000, currency: "USD" },
  { date: "2026-04", value: 30500, currency: "USD" }
];

export const mockCashflow = {
  result: [
    {
      date: "2026-01",
      in: 45000,
      out: 30000
    },
    {
      date: "2026-02",
      in: 52000,
      out: 34000
    },
    {
      date: "2026-03",
      in: 48000,
      out: 32000
    },
    {
      date: "2026-04",
      in: 61000,
      out: 37000
    }
  ],
  summary: {
    totalIn: 206000,
    totalOut: 133000,
    net: 73000,
    currency: "USD"
  }
};

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const mockTransactions = [
  {
    id: "txn_1",
    teamId: "team_1",
    bankAccountId: "acc_1",
    name: "Stripe Payout",
    amount: 15400.00,
    currency: "USD",
    date: "2026-04-15",
    status: "posted",
    category: { id: "cat_1", name: "Revenue", slug: "revenue" },
    method: "transfer",
    note: "April mid-month payout",
    assigned: null,
    attachments: [],
    tags: [{ id: "tag_1", name: "income" }],
    createdAt: "2026-04-15T00:00:00.000Z",
    description: "Stripe Transfer STRIPE Payout",
    internal: false,
    recurring: false,
    isFulfilled: true
  },
  {
    id: "txn_2",
    teamId: "team_1",
    bankAccountId: "acc_1",
    name: "AWS Web Services",
    amount: -1250.45,
    currency: "USD",
    date: "2026-04-12",
    status: "posted",
    category: { id: "cat_2", name: "Software", slug: "software" },
    method: "card",
    note: "Cloud hosting for production",
    assigned: { id: "usr_1", name: "John Doe", avatarUrl: "" },
    attachments: [{ id: "att_1", name: "aws_invoice_apr.pdf", url: "#" }],
    tags: [{ id: "tag_2", name: "infrastructure" }],
    createdAt: "2026-04-12T00:00:00.000Z",
    description: "Amazon Web Services AWS.COM",
    internal: false,
    recurring: true,
    frequency: "monthly",
    isFulfilled: true
  },
  {
    id: "txn_3",
    teamId: "team_1",
    bankAccountId: "acc_1",
    name: "Office Supplies - Staples",
    amount: -245.50,
    currency: "USD",
    date: "2026-04-10",
    status: "posted",
    category: { id: "cat_3", name: "Office", slug: "office" },
    method: "card",
    note: "Monthly office supplies order",
    assigned: null,
    attachments: [],
    tags: [],
    createdAt: "2026-04-10T00:00:00.000Z",
    description: "STAPLES INC STORE 1029",
    internal: false,
    recurring: false,
    isFulfilled: true
  },
  {
    id: "txn_4",
    teamId: "team_1",
    bankAccountId: "acc_1",
    name: "Gusto Payroll",
    amount: -18450.00,
    currency: "USD",
    date: "2026-04-01",
    status: "posted",
    category: { id: "cat_4", name: "Payroll", slug: "payroll" },
    method: "transfer",
    note: "March payroll",
    assigned: null,
    attachments: [],
    tags: [{ id: "tag_3", name: "hr" }],
    createdAt: "2026-04-01T00:00:00.000Z",
    description: "GUSTO PAYROLL ACH",
    internal: false,
    recurring: true,
    frequency: "monthly",
    isFulfilled: true
  }
];

export const mockTransactionCategories = [
  { id: "cat_1", name: "Revenue", slug: "revenue" },
  { id: "cat_2", name: "Software", slug: "software" },
  { id: "cat_3", name: "Office", slug: "office" },
  { id: "cat_4", name: "Payroll", slug: "payroll" },
  { id: "cat_5", name: "Travel", slug: "travel" },
  { id: "cat_6", name: "Marketing", slug: "marketing" },
  { id: "cat_7", name: "Equipment", slug: "equipment" }
];

// ============================================================================
// INVOICES
// ============================================================================

export const mockInvoices = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2026-001",
    customerId: "cust_1",
    customer: { id: "cust_1", name: "Acme Corp", email: "billing@acme.corp" },
    amount: 12500.00,
    currency: "USD",
    status: "paid",
    issueDate: "2026-03-01T00:00:00.000Z",
    dueDate: "2026-03-31T00:00:00.000Z",
    paidAt: "2026-03-28T00:00:00.000Z",
    items: [
      { id: "item_1", description: "Q1 Consulting Retainer", quantity: 1, price: 12500.00 }
    ],
    notes: "Thank you for your business.",
    recurring: false
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2026-002",
    customerId: "cust_2",
    customer: { id: "cust_2", name: "TechStart Inc", email: "finance@techstart.io" },
    amount: 8400.00,
    currency: "USD",
    status: "overdue",
    issueDate: "2026-03-15T00:00:00.000Z",
    dueDate: "2026-04-14T00:00:00.000Z",
    paidAt: null,
    items: [
      { id: "item_2", description: "Backend Development (March)", quantity: 120, price: 70.00 }
    ],
    notes: "Please remit payment at your earliest convenience.",
    recurring: false
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2026-003",
    customerId: "cust_1",
    customer: { id: "cust_1", name: "Acme Corp", email: "billing@acme.corp" },
    amount: 12500.00,
    currency: "USD",
    status: "unpaid",
    issueDate: "2026-04-01T00:00:00.000Z",
    dueDate: "2026-04-30T00:00:00.000Z",
    paidAt: null,
    items: [
      { id: "item_3", description: "Q2 Consulting Retainer", quantity: 1, price: 12500.00 }
    ],
    notes: "Thank you for your business.",
    recurring: false
  },
  {
    id: "inv_4",
    invoiceNumber: "INV-2026-004",
    customerId: "cust_3",
    customer: { id: "cust_3", name: "Global Logistics", email: "ap@globallogistics.com" },
    amount: 4500.00,
    currency: "USD",
    status: "draft",
    issueDate: "2026-04-15T00:00:00.000Z",
    dueDate: "2026-05-15T00:00:00.000Z",
    paidAt: null,
    items: [
      { id: "item_4", description: "System Audit", quantity: 1, price: 4500.00 }
    ],
    notes: "Draft invoice for review.",
    recurring: false
  }
];

export const mockInvoiceSummary = {
  total: 4,
  paidAmount: 12500,
  unpaidAmount: 20900,
  overdueAmount: 8400,
  draftAmount: 4500,
  currency: "USD"
};

// ============================================================================
// CUSTOMERS
// ============================================================================

export const mockCustomers = [
  {
    id: "cust_1",
    name: "Acme Corp",
    email: "billing@acme.corp",
    phone: "+1-555-0198",
    website: "https://acme.corp",
    address: "123 Innovation Way, Tech City, CA 94016",
    status: "active",
    createdAt: "2025-01-10T00:00:00.000Z",
    totalBilled: 150000,
    currency: "USD"
  },
  {
    id: "cust_2",
    name: "TechStart Inc",
    email: "finance@techstart.io",
    phone: "+1-555-0245",
    website: "https://techstart.io",
    address: "456 Startup Blvd, Suite 200, Austin, TX 78701",
    status: "active",
    createdAt: "2025-06-22T00:00:00.000Z",
    totalBilled: 42000,
    currency: "USD"
  },
  {
    id: "cust_3",
    name: "Global Logistics",
    email: "ap@globallogistics.com",
    phone: "+1-555-0899",
    website: "https://globallogistics.com",
    address: "789 Freight Rd, Chicago, IL 60601",
    status: "active",
    createdAt: "2026-02-05T00:00:00.000Z",
    totalBilled: 0,
    currency: "USD"
  }
];

// ============================================================================
// TRACKER (Time Tracking)
// ============================================================================

export const mockTrackerEntries = {
  result: [
    {
      id: "trk_1",
      userId: "usr_1",
      projectId: "proj_1",
      project: { id: "proj_1", name: "Acme Q2 Retainer" },
      description: "Strategy planning session",
      date: "2026-04-14",
      duration: 7200, // 2 hours in seconds
      startTime: "09:00",
      endTime: "11:00",
      billable: true,
      amount: 300, // e.g. $150/hr
      currency: "USD"
    },
    {
      id: "trk_2",
      userId: "usr_1",
      projectId: "proj_2",
      project: { id: "proj_2", name: "TechStart API" },
      description: "Database schema design",
      date: "2026-04-15",
      duration: 14400, // 4 hours in seconds
      startTime: "13:00",
      endTime: "17:00",
      billable: true,
      amount: 400, // e.g. $100/hr
      currency: "USD"
    },
    {
      id: "trk_3",
      userId: "usr_1",
      projectId: "proj_3",
      project: { id: "proj_3", name: "Internal Admin" },
      description: "Weekly team meeting",
      date: "2026-04-16",
      duration: 3600, // 1 hour
      startTime: "10:00",
      endTime: "11:00",
      billable: false,
      amount: 0,
      currency: "USD"
    }
  ],
  summary: {
    totalDuration: 25200, // 7 hours
    billableDuration: 21600, // 6 hours
    billableAmount: 700,
    currency: "USD"
  }
};

// ============================================================================
// VAULT (Document Management)
// ============================================================================

export const mockVaultDocuments = [
  {
    id: "doc_1",
    name: "Acme_Q2_Contract.pdf",
    size: 2450000, // 2.45 MB
    type: "application/pdf",
    url: "#",
    folderId: "fold_1",
    tags: [{ id: "tag_4", name: "contract" }],
    uploadedBy: { id: "usr_1", name: "John Doe" },
    createdAt: "2026-03-25T00:00:00.000Z",
    updatedAt: "2026-03-25T00:00:00.000Z"
  },
  {
    id: "doc_2",
    name: "TechStart_API_Specs.docx",
    size: 1250000,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    url: "#",
    folderId: "fold_2",
    tags: [{ id: "tag_5", name: "specifications" }],
    uploadedBy: { id: "usr_2", name: "Jane Smith" },
    createdAt: "2026-04-02T00:00:00.000Z",
    updatedAt: "2026-04-05T00:00:00.000Z"
  },
  {
    id: "doc_3",
    name: "Q1_Financial_Report.xlsx",
    size: 5800000,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    url: "#",
    folderId: "fold_3",
    tags: [{ id: "tag_6", name: "finance" }, { id: "tag_7", name: "report" }],
    uploadedBy: { id: "usr_1", name: "John Doe" },
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-10T00:00:00.000Z"
  }
];

// ============================================================================
// INBOX
// ============================================================================

export const mockInboxMessages = [
  {
    id: "msg_1",
    subject: "Action Required: Re-authenticate Gusto",
    sender: { name: "Quadra System", email: "ajju40959@gmail.com" },
    preview: "Your Gusto connection has expired and requires re-authentication.",
    isRead: false,
    date: "2026-04-17T08:30:00.000Z",
    type: "system_alert",
    actionUrl: "/apps/gusto"
  },
  {
    id: "msg_2",
    subject: "Invoice INV-2026-001 Paid",
    sender: { name: "Acme Corp", email: "billing@acme.corp" },
    preview: "Payment of $12,500.00 has been received for invoice INV-2026-001.",
    isRead: true,
    date: "2026-03-28T14:15:00.000Z",
    type: "invoice_paid",
    actionUrl: "/invoices/inv_1"
  },
  {
    id: "msg_3",
    subject: "New document uploaded: TechStart_API_Specs.docx",
    sender: { name: "Jane Smith", email: "jane@example.com" },
    preview: "Jane Smith has uploaded a new document to the Vault.",
    isRead: true,
    date: "2026-04-02T10:05:00.000Z",
    type: "vault_upload",
    actionUrl: "/vault/doc_2"
  }
];

// ============================================================================
// APPS
// ============================================================================

export const mockApps = [
  {
    id: "app_stripe",
    name: "Stripe",
    description: "Accept payments and sync payout data.",
    icon: "stripe",
    connected: true,
    lastSync: "2026-04-17T09:00:00.000Z",
    status: "active"
  },
  {
    id: "app_gusto",
    name: "Gusto",
    description: "Sync payroll data and team information.",
    icon: "gusto",
    connected: true,
    lastSync: "2026-03-31T23:59:00.000Z",
    status: "needs_auth"
  },
  {
    id: "app_slack",
    name: "Slack",
    description: "Receive notifications in your Slack workspace.",
    icon: "slack",
    connected: false,
    lastSync: null,
    status: "disconnected"
  }
];

// ============================================================================
// SETTINGS
// ============================================================================

export const mockSettings = {
  team: {
    id: "team_1",
    name: "Quadra Engineering PMC",
    currency: "USD",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/dd/yyyy",
    fiscalYearStart: "01",
    address: "123 Builder Lane",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "US"
  },
  notifications: {
    emailAlerts: true,
    slackAlerts: false,
    weeklyReport: true,
    invoiceStatus: true
  }
};

// ============================================================================
// ACCOUNT
// ============================================================================

export const mockAccount = {
  id: "usr_1",
  name: "John Doe",
  email: "john@example.com",
  avatarUrl: "https://github.com/shadcn.png",
  role: "admin",
  createdAt: "2025-01-01T00:00:00.000Z",
  preferences: {
    theme: "system",
    language: "en-US",
    weekStartsOnMonday: true
  }
};

// ============================================================================
// UPGRADE (Billing)
// ============================================================================

export const mockPlans = [
  {
    id: "plan_free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "Up to 50 transactions/mo",
      "Basic reports",
      "1 team member",
      "Community support"
    ],
    isCurrent: false
  },
  {
    id: "plan_pro",
    name: "Pro",
    price: 29,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited transactions",
      "Advanced financial reports",
      "Up to 5 team members",
      "Priority email support",
      "Custom invoice branding"
    ],
    isCurrent: true,
    currentPeriodEnd: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "plan_business",
    name: "Business",
    price: 99,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated account manager",
      "API access",
      "SSO / SAML"
    ],
    isCurrent: false
  }
];
