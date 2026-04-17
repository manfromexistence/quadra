import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const appRouter = t.router({
  // Test endpoint
  test: t.router({
    hello: t.procedure.query(() => {
      console.log("[tRPC] test.hello: Starting query");
      return { message: "Hello from tRPC!", timestamp: new Date().toISOString() };
    }),
  }),

  // Overview
  overview: t.router({
    summary: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] overview.summary: Starting query");
      
      // Always return mock data for now to test serialization
      const mockData = {
        openInvoices: {
          count: 3,
          totalAmount: 15750.00,
          currency: "USD",
        },
        unbilledTime: {
          totalDuration: 2400, // 40 hours in minutes
          totalAmount: 4800.00,
          projectCount: 2,
          currency: "USD",
        },
        inboxPending: {
          count: 5,
        },
        transactionsToReview: {
          count: 12,
        },
        cashBalance: {
          totalBalance: 45230.50,
          currency: "USD",
          accountCount: 2,
        },
        runway: 6, // months
      };
      
      console.log("[tRPC] overview.summary: Returning data:", JSON.stringify(mockData));
      return mockData;
    }),
  }),

  // User
  user: t.router({
    me: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] user.me: Starting query");
      
      const mockUser = {
        id: "user_1",
        email: "john@example.com",
        name: "John Doe",
        image: null,
        emailVerified: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        role: "user",
        organization: "ACME Corp",
        jobTitle: "Project Manager",
        phone: null,
        department: "Construction",
        notificationPreferences: null,
        isActive: true,
      };
      
      console.log("[tRPC] user.me: Returning user:", JSON.stringify(mockUser, null, 2));
      return mockUser;
    }),
    update: t.procedure
      .input(z.object({
        timezone: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        jobTitle: z.string().optional(),
        phone: z.string().optional(),
        department: z.string().optional(),
        notificationPreferences: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log("[tRPC] user.update: Starting mutation with input:", JSON.stringify(input));
        
        // Mock update - in real app this would update the database
        const updatedUser = {
          id: "user_1",
          email: "john@example.com",
          name: input.name || "John Doe",
          image: null,
          emailVerified: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date(), // Current timestamp for update
          role: "user",
          organization: "ACME Corp",
          jobTitle: input.jobTitle || "Project Manager",
          phone: input.phone || null,
          department: input.department || "Construction",
          notificationPreferences: input.notificationPreferences || null,
          isActive: true,
          timezone: input.timezone || null,
        };
        
        console.log("[tRPC] user.update: Returning updated user:", JSON.stringify(updatedUser, null, 2));
        return updatedUser;
      }),
  }),

  // Notifications
  notifications: t.router({
    list: t.procedure
      .input(z.object({
        maxPriority: z.number().optional(),
        pageSize: z.number().optional(),
        status: z.union([z.string(), z.array(z.string())]).optional(),
      }).optional())
      .query((opts) => {
        console.log("[tRPC] notifications.list: Starting query with input:", opts.input);
        const mockNotifications: any[] = [];
        console.log("[tRPC] notifications.list: Returning notifications:", JSON.stringify(mockNotifications));
        return mockNotifications;
      }),
  }),

  // Team Members
  team: t.router({
    current: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] team.current: Starting query");
      
      const mockTeam = {
        id: "team_1",
        name: "ACME Corp",
        email: "team@acme.com",
        logoUrl: null,
        inboxId: null,
        inboxEmail: null,
        inboxForwarding: false,
        baseCurrency: "USD",
        documentClassification: true,
        plan: "pro",
        createdAt: new Date("2024-01-01"),
        canceledAt: null,
      };
      
      console.log("[tRPC] team.current: Returning team:", JSON.stringify(mockTeam, null, 2));
      return mockTeam;
    }),
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] team.list: Starting query");
      
      const mockTeams = [{
        id: "team_1",
        name: "ACME Corp",
        email: "team@acme.com",
        logoUrl: null,
        inboxId: null,
        inboxEmail: null,
        inboxForwarding: false,
        baseCurrency: "USD",
        documentClassification: true,
        plan: "pro",
        createdAt: new Date("2024-01-01"),
        canceledAt: null,
      }];
      
      console.log("[tRPC] team.list: Returning teams:", JSON.stringify(mockTeams, null, 2));
      return mockTeams;
    }),
    members: t.procedure.query(() => {
      console.log("[tRPC] team.members: Starting query");
      
      const mockMembers = [
        {
          id: "user_1",
          email: "john@example.com",
          name: "John Doe",
          role: "owner",
          avatarUrl: null,
          createdAt: new Date("2024-01-01"),
        }
      ];
      
      console.log("[tRPC] team.members: Returning members:", mockMembers);
      return mockMembers;
    }),
    invitesByEmail: t.procedure.query(() => {
      console.log("[tRPC] team.invitesByEmail: Starting query");
      return [];
    }),
    connectionStatus: t.procedure.query(() => {
      console.log("[tRPC] team.connectionStatus: Starting query");
      
      const mockStatus = {
        bankConnections: [
          {
            id: "bank_1",
            name: "Chase Business Checking",
            status: "connected" as const,
            logoUrl: null,
            expiresAt: new Date("2024-06-01"), // Future date - no issues
          },
          {
            id: "bank_2", 
            name: "Wells Fargo Savings",
            status: "connected" as const,
            logoUrl: null,
            expiresAt: new Date("2024-05-15"), // Expiring soon - warning
          }
        ],
        inboxAccounts: [
          {
            id: "inbox_1",
            email: "invoices@acme.com",
            status: "connected" as const,
            provider: "gmail" as const,
          }
        ],
        // Legacy fields for backward compatibility
        isConnected: true,
        lastSync: new Date("2024-01-01"),
        provider: "mock",
      };
      
      console.log("[tRPC] team.connectionStatus: Returning status:", JSON.stringify(mockStatus, null, 2));
      return mockStatus;
    }),
  }),

  // Bank Accounts
  bankAccounts: t.router({
    get: t.procedure
      .input(z.object({
        manual: z.boolean().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] bankAccounts.get: Starting query with input:", input);
        
        const mockAccounts = [
          {
            id: "acc_1",
            name: "Chase Business Checking",
            type: "checking",
            balance: 25430.50,
            currency: "USD",
            institutionId: "chase",
            accountId: "12345",
            enabled: true,
            manual: input?.manual || false,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          {
            id: "acc_2",
            name: "Wells Fargo Savings", 
            type: "savings",
            balance: 19800.00,
            currency: "USD",
            institutionId: "wells_fargo",
            accountId: "67890",
            enabled: true,
            manual: input?.manual || false,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          }
        ];
        
        console.log("[tRPC] bankAccounts.get: Returning accounts:", mockAccounts);
        return mockAccounts;
      }),
  }),

  // Bank Connections
  bankConnections: t.router({
    get: t.procedure.query(() => {
      console.log("[tRPC] bankConnections.get: Starting query");
      
      const mockConnections = [
        {
          id: "conn_1",
          name: "Chase Business Banking",
          provider: "plaid",
          status: "connected" as const,
          logoUrl: null,
          expiresAt: new Date("2024-06-01"),
          institutionId: "chase",
          accessToken: "mock_token_1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          // Include bankAccounts array that the component expects
          bankAccounts: [
            {
              id: "acc_1",
              name: "Chase Business Checking",
              type: "checking",
              balance: 25430.50,
              currency: "USD",
              accountId: "12345",
              enabled: true,
              manual: false,
            },
            {
              id: "acc_1_savings",
              name: "Chase Business Savings",
              type: "savings", 
              balance: 12000.00,
              currency: "USD",
              accountId: "12346",
              enabled: true,
              manual: false,
            }
          ]
        },
        {
          id: "conn_2",
          name: "Wells Fargo Banking",
          provider: "plaid",
          status: "connected" as const,
          logoUrl: null,
          expiresAt: new Date("2024-05-15"), // Expiring soon
          institutionId: "wells_fargo",
          accessToken: "mock_token_2",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          // Include bankAccounts array that the component expects
          bankAccounts: [
            {
              id: "acc_2",
              name: "Wells Fargo Savings",
              type: "savings",
              balance: 19800.00,
              currency: "USD",
              accountId: "67890",
              enabled: true,
              manual: false,
            }
          ]
        }
      ];
      
      console.log("[tRPC] bankConnections.get: Returning connections:", JSON.stringify(mockConnections, null, 2));
      return mockConnections;
    }),
  }),

  // Invoice
  invoice: t.router({
    defaultSettings: t.procedure.query(() => {
      console.log("[tRPC] invoice.defaultSettings: Starting query");
      
      const mockSettings = {
        template: "default",
        currency: "USD",
        dueDate: 30,
        from: {
          name: "Quadra Construction",
          email: "team@quadra.com",
        },
      };
      
      console.log("[tRPC] invoice.defaultSettings: Returning settings:", JSON.stringify(mockSettings));
      return mockSettings;
    }),
    getInvoiceByToken: t.procedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] invoice.getInvoiceByToken: Starting query for token:", input.token);
        return null;
      }),
  }),

  // Customers
  customers: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.customers).where(eq(schema.customers.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] customers.list: Found", result.length, "customers");
        return result;
      } catch (error) {
        console.error("[tRPC] customers.list error:", error);
        return [];
      }
    }),
    getByPortalId: t.procedure
      .input(z.object({ portalId: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] customers.getByPortalId: Starting query for portalId:", input.portalId);
        return null;
      }),
    getPortalInvoices: t.procedure
      .input(z.object({ portalId: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] customers.getPortalInvoices: Starting query for portalId:", input.portalId);
        return { data: [], nextCursor: null };
      }),
  }),

  // Short Links
  shortLinks: t.router({
    get: t.procedure
      .input(z.object({ shortId: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] shortLinks.get: Starting query for shortId:", input.shortId);
        return null;
      }),
  }),

  // Tracker Entries
  trackerEntries: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] trackerEntries.list: Starting query");
      return [];
    }),
    getTimerStatus: t.procedure.query(() => {
      console.log("[tRPC] trackerEntries.getTimerStatus: Starting query");
      
      const mockStatus = {
        isRunning: false,
        currentEntry: null,
        totalToday: 0,
      };
      
      console.log("[tRPC] trackerEntries.getTimerStatus: Returning status:", JSON.stringify(mockStatus));
      return mockStatus;
    }),
    getBillableHours: t.procedure
      .input(z.object({
        date: z.string(),
        view: z.string().optional(),
      }))
      .query(({ input }) => {
        console.log("[tRPC] trackerEntries.getBillableHours: Starting query with input:", input);
        return { totalHours: 0, entries: [] };
      }),
  }),

  // Transactions
  transactions: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.transactions).where(eq(schema.transactions.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] transactions.list: Found", result.length, "transactions");
        return result;
      } catch (error) {
        console.error("[tRPC] transactions.list error:", error);
        return [];
      }
    }),
    get: t.procedure.query(() => {
      console.log("[tRPC] transactions.get: Starting query");
      return { data: [], nextCursor: null };
    }),
    getById: t.procedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] transactions.getById: Starting query for ID:", input.id);
        return null;
      }),
  }),

  // Reports
  reports: t.router({
    revenue: t.procedure.query(() => {
      console.log("[tRPC] reports.revenue: Starting query");
      return { data: [], summary: { total: 0, currency: "USD" } };
    }),
    profit: t.procedure.query(() => {
      console.log("[tRPC] reports.profit: Starting query");
      return { data: [], summary: { total: 0, currency: "USD" } };
    }),
    expense: t.procedure.query(() => {
      console.log("[tRPC] reports.expense: Starting query");
      return { data: [], summary: { total: 0, currency: "USD" } };
    }),
    spending: t.procedure.query(() => {
      console.log("[tRPC] reports.spending: Starting query");
      return { data: [], summary: { total: 0, currency: "USD" } };
    }),
    taxSummary: t.procedure.query(() => {
      console.log("[tRPC] reports.taxSummary: Starting query");
      return { data: [], summary: { total: 0, currency: "USD" } };
    }),
    revenueForecast: t.procedure.query(() => {
      console.log("[tRPC] reports.revenueForecast: Starting query");
      return { data: [], summary: { total: 0, currency: "USD" } };
    }),
    getByLinkId: t.procedure
      .input(z.object({ linkId: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] reports.getByLinkId: Starting query for linkId:", input.linkId);
        return null;
      }),
  }),

  // Documents
  documents: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.vaultFiles).where(eq(schema.vaultFiles.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] documents.list: Found", result.length, "files");
        return result;
      } catch (error) {
        console.error("[tRPC] documents.list error:", error);
        return [];
      }
    }),
    signedUrls: t.procedure
      .input(z.object({
        fileIds: z.array(z.string()),
      }))
      .mutation(({ input }) => {
        console.log("[tRPC] documents.signedUrls: Generating URLs for files:", input.fileIds);
        return input.fileIds.map(id => ({ id, url: `https://example.com/file/${id}` }));
      }),
  }),

  // Transaction Categories
  transactionCategories: t.router({
    get: t.procedure.query(() => []),
  }),

  // Tracker
  trackerProjects: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.trackerProjects).where(eq(schema.trackerProjects.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] trackerProjects.list: Found", result.length, "projects");
        return result;
      } catch (error) {
        console.error("[tRPC] trackerProjects.list error:", error);
        return [];
      }
    }),
  }),

  // Search
  search: t.router({
    global: t.procedure
      .input(z.object({ query: z.string() }).optional())
      .query(() => {
        console.log("[tRPC] search.global: Returning empty array");
        return [];
      }),
  }),

  // Connectors
  connectors: t.router({
    connections: t.procedure.query(() => {
      console.log("[tRPC] connectors.connections: Returning empty array");
      return [];
    }),
    list: t.procedure.query(() => {
      console.log("[tRPC] connectors.list: Starting query");
      return [];
    }),
  }),
});

export type AppRouter = typeof appRouter;
