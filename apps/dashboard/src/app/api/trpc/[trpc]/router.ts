import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";
import superjson from "superjson";
import * as mockData from "./mock-data";

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
      
      return {
        openInvoices: {
          count: 3,
          totalAmount: 25400.00,
          currency: "USD",
        },
        unbilledTime: {
          totalDuration: 21600, // 6 hours in seconds
          totalAmount: 700.00,
          projectCount: 2,
          currency: "USD",
        },
        inboxPending: {
          count: mockData.mockInboxMessages.filter(m => !m.isRead).length,
        },
        transactionsToReview: {
          count: 0,
        },
        cashBalance: {
          totalBalance: 45230.50,
          currency: "USD",
          accountCount: 2,
        },
        runway: 6,
        edmsMetrics: {
          projects: {
            value: "7",
            description: "Active projects",
          },
          documents: {
            value: "184",
            description: "Controlled documents",
          },
          workflows: {
            value: "12",
            description: "Pending reviews",
          },
          transmittals: {
            value: "5",
            description: "Open transmittals",
          },
          notifications: {
            value: "9",
            description: "Unread alerts",
          },
        },
      };
    }),
  }),

  // User
  user: t.router({
    me: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] user.me: Starting query");
      return mockData.mockAccount;
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
        return { ...mockData.mockAccount, ...input, updatedAt: new Date().toISOString() };
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
        return [];
      }),
  }),

  // Team
  team: t.router({
    current: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] team.current: Starting query");
      return mockData.mockSettings.team;
    }),
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] team.list: Starting query");
      return [mockData.mockSettings.team];
    }),
    members: t.procedure.query(() => {
      console.log("[tRPC] team.members: Starting query");
      return [
        {
          id: mockData.mockAccount.id,
          email: mockData.mockAccount.email,
          name: mockData.mockAccount.name,
          role: mockData.mockAccount.role,
          avatarUrl: mockData.mockAccount.avatarUrl,
          createdAt: mockData.mockAccount.createdAt,
        }
      ];
    }),
    invitesByEmail: t.procedure.query(() => {
      console.log("[tRPC] team.invitesByEmail: Starting query");
      return [];
    }),
    connectionStatus: t.procedure.query(() => {
      console.log("[tRPC] team.connectionStatus: Starting query");
      return {
        bankConnections: [
          {
            id: "bank_1",
            name: "Chase Business Checking",
            status: "connected" as const,
            logoUrl: null,
            expiresAt: "2026-12-01T00:00:00.000Z",
          },
          {
            id: "bank_2",
            name: "Wells Fargo Savings",
            status: "connected" as const,
            logoUrl: null,
            expiresAt: "2026-11-15T00:00:00.000Z",
          }
        ],
        inboxAccounts: [
          {
            id: "inbox_1",
            email: "invoices@quadra.com",
            status: "connected" as const,
            provider: "gmail" as const,
          }
        ],
        isConnected: true,
        lastSync: new Date().toISOString(),
        provider: "mock",
      };
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
        return [
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
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
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
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          }
        ];
      }),
    currencies: t.procedure.query(() => {
      console.log("[tRPC] bankAccounts.currencies: Returning currencies");
      return [
        { id: "acc_1", currency: "USD" },
        { id: "acc_2", currency: "USD" },
      ];
    }),
  }),

  // Bank Connections
  bankConnections: t.router({
    get: t.procedure.query(() => {
      console.log("[tRPC] bankConnections.get: Starting query");
      return [
        {
          id: "conn_1",
          name: "Chase Business Banking",
          provider: "plaid",
          status: "connected" as const,
          logoUrl: null,
          expiresAt: "2026-12-01T00:00:00.000Z",
          institutionId: "chase",
          accessToken: "mock_token_1",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
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
            }
          ]
        },
        {
          id: "conn_2",
          name: "Wells Fargo Banking",
          provider: "plaid",
          status: "connected" as const,
          logoUrl: null,
          expiresAt: "2026-11-15T00:00:00.000Z",
          institutionId: "wells_fargo",
          accessToken: "mock_token_2",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
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
    }),
  }),

  // Invoices
  invoice: t.router({
    defaultSettings: t.procedure.query(() => {
      console.log("[tRPC] invoice.defaultSettings: Starting query");
      return {
        template: "default",
        currency: "USD",
        dueDate: 30,
        from: {
          name: "Quadra Construction",
          email: "team@quadra.com",
        },
      };
    }),
    get: t.procedure
      .input(z.object({
        sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).nullable().optional(),
        statuses: z.array(z.string()).nullable().optional(),
        customers: z.array(z.string()).nullable().optional(),
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        q: z.string().nullable().optional(),
        ids: z.array(z.string()).nullable().optional(),
        recurringIds: z.array(z.string()).nullable().optional(),
        recurring: z.boolean().nullable().optional(),
        direction: z.string().nullable().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] invoice.get: Returning mock invoices with input:", input);
        let filtered = [...mockData.mockInvoices];
        
        if (input?.statuses && input.statuses.length > 0) {
          filtered = filtered.filter(inv => input.statuses!.includes(inv.status));
        }
        
        return {
          data: filtered,
          meta: { cursor: null, hasMore: false }
        };
      }),
    invoiceSummary: t.procedure
      .input(z.object({
        statuses: z.array(z.string()),
      }))
      .query(({ input }) => {
        console.log("[tRPC] invoice.invoiceSummary: Calculating for statuses:", input.statuses);
        const filtered = mockData.mockInvoices.filter(inv => input.statuses.includes(inv.status));
        const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);
        return {
          invoiceCount: filtered.length,
          totalAmount,
          currency: "USD",
          breakdown: [
            {
              currency: "USD",
              count: filtered.length,
              originalAmount: totalAmount,
              convertedAmount: totalAmount,
            }
          ]
        };
      }),
    paymentStatus: t.procedure.query(() => {
      console.log("[tRPC] invoice.paymentStatus: Returning payment score");
      return {
        score: 85,
        trend: "up",
        averageDays: 12,
        paymentStatus: "good",
      };
    }),
    getInvoiceByToken: t.procedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] invoice.getInvoiceByToken: Starting query for token:", input.token);
        return null;
      }),
    mostActiveClient: t.procedure.query(() => {
      console.log("[tRPC] invoice.mostActiveClient: Returning most active client");
      return {
        customerName: "Acme Corp",
        invoiceCount: 2,
        totalTrackerTime: 14400, // 4 hours in seconds
        currency: "USD",
      };
    }),
    inactiveClientsCount: t.procedure.query(() => {
      console.log("[tRPC] invoice.inactiveClientsCount: Returning inactive clients count");
      return 0;
    }),
    topRevenueClient: t.procedure.query(() => {
      console.log("[tRPC] invoice.topRevenueClient: Returning top revenue client");
      return {
        customerName: "Acme Corp",
        totalRevenue: 25000,
        currency: "USD",
        invoiceCount: 2,
      };
    }),
    newCustomersCount: t.procedure.query(() => {
      console.log("[tRPC] invoice.newCustomersCount: Returning new customers count");
      return 1;
    }),
  }),

  // Customers
  customers: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] customers.list: Returning mock customers");
      return mockData.mockCustomers;
    }),
    get: t.procedure
      .input(z.object({
        sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).nullable().optional(),
        statuses: z.array(z.string()).nullable().optional(),
        q: z.string().nullable().optional(),
        pageSize: z.number().nullable().optional(),
        direction: z.string().nullable().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] customers.get: Returning mock customers with input:", input);
        return {
          data: mockData.mockCustomers,
          meta: { cursor: null, hasMore: false }
        };
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
      console.log("[tRPC] trackerEntries.list: Returning mock entries");
      return mockData.mockTrackerEntries;
    }),
    getTimerStatus: t.procedure.query(() => {
      console.log("[tRPC] trackerEntries.getTimerStatus: Starting query");
      return {
        isRunning: false,
        currentEntry: null,
        totalToday: 19800,
      };
    }),
    getBillableHours: t.procedure
      .input(z.object({
        date: z.string(),
        view: z.string().optional(),
        weekStartsOnMonday: z.boolean().optional(),
      }))
      .query(({ input }) => {
        console.log("[tRPC] trackerEntries.getBillableHours: Starting query with input:", input);
        return mockData.mockTrackerEntries;
      }),
    byRange: t.procedure
      .input(z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
      }))
      .query(({ input }) => {
        console.log("[tRPC] trackerEntries.byRange: Returning entries for range:", input);
        
        // Support both from/to and start/end parameter names
        const startDate = new Date(input.start || input.from || "2026-04-01");
        const endDate = new Date(input.end || input.to || "2026-04-30");
        
        if (mockData.mockTrackerEntries.result) {
          const filtered = mockData.mockTrackerEntries.result.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
          });
          return filtered;
        }
        
        return [];
      }),
  }),

  // Tracker Projects
  trackerProjects: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] trackerProjects.list: Returning mock projects");
      return [];
    }),
    get: t.procedure
      .input(z.object({
        sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).nullable().optional(),
        status: z.array(z.string()).nullable().optional(),
        q: z.string().nullable().optional(),
        customers: z.array(z.string()).nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        direction: z.string().nullable().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] trackerProjects.get: Returning mock projects with input:", input);
        return {
          data: [],
          meta: { cursor: null, hasMore: false }
        };
      }),
  }),

  // Transactions
  transactions: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] transactions.list: Returning mock data");
      return mockData.mockTransactions;
    }),
    get: t.procedure
      .input(z.object({
        sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).nullable().optional(),
        amountRange: z.tuple([z.number(), z.number()]).nullable().optional(),
        categories: z.array(z.string()).nullable().optional(),
        accounts: z.array(z.string()).nullable().optional(),
        statuses: z.array(z.string()).nullable().optional(),
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        q: z.string().nullable().optional(),
        pageSize: z.number().nullable().optional(),
        direction: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        assignees: z.array(z.string()).nullable().optional(),
        attachments: z.boolean().nullable().optional(),
        amount: z.number().nullable().optional(),
        amount_range: z.tuple([z.number(), z.number()]).nullable().optional(),
        recurring: z.boolean().nullable().optional(),
        manual: z.boolean().nullable().optional(),
        type: z.string().nullable().optional(),
        fulfilled: z.boolean().nullable().optional(),
        exported: z.boolean().nullable().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] transactions.get: Returning mock data with input:", input);
        const response = {
          data: mockData.mockTransactions,
          meta: { 
            cursor: null, 
            hasMore: false 
          }
        };
        console.log("[tRPC] transactions.get: Response structure:", JSON.stringify({
          dataLength: response.data.length,
          meta: response.meta
        }));
        return response;
      }),
    getById: t.procedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] transactions.getById: Starting query for ID:", input.id);
        const transaction = mockData.mockTransactions.find(t => t.id === input.id);
        return transaction || null;
      }),
    getReviewCount: t.procedure.query(() => {
      console.log("[tRPC] transactions.getReviewCount: Returning count");
      return { count: 0 };
    }),
    getSimilarTransactions: t.procedure
      .input(z.object({
        transactionId: z.string(),
        name: z.string(),
      }))
      .query(({ input }) => {
        console.log("[tRPC] transactions.getSimilarTransactions: Finding similar transactions");
        const similar = mockData.mockTransactions.filter(
          t => t.id !== input.transactionId &&
          t.name.toLowerCase().includes(input.name.toLowerCase().split(' ')[0])
        );
        return similar.slice(0, 5);
      }),
  }),

  // Transaction Categories
  transactionCategories: t.router({
    get: t.procedure.query(() => {
      console.log("[tRPC] transactionCategories.get: Returning mock categories");
      return mockData.mockTransactionCategories;
    }),
  }),

  // Reports
  reports: t.router({
    revenue: t.procedure
      .input(z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        period: z.string().optional(),
        currency: z.string().optional(),
        revenueType: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.revenue: Returning mock revenue data");
        return mockData.mockRevenue;
      }),
    profit: t.procedure
      .input(z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        period: z.string().optional(),
        currency: z.string().optional(),
        revenueType: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.profit: Returning mock profit data");
        return mockData.mockProfit;
      }),
    expense: t.procedure
      .input(z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        period: z.string().optional(),
        categories: z.array(z.string()).optional(),
        currency: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.expense: Returning mock expense data");
        return mockData.mockExpenses;
      }),
    spending: t.procedure
      .input(z.object({
        start: z.string().optional(),
        end: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        currency: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.spending: Returning mock spending data");
        // CategoryExpensesCard expects an array with { name, amount } properties
        // Flatten the expense categories from all months
        const allCategories: Record<string, number> = {};
        
        mockData.mockExpenses.result.forEach(month => {
          month.categories.forEach(cat => {
            if (allCategories[cat.name]) {
              allCategories[cat.name] += cat.value;
            } else {
              allCategories[cat.name] = cat.value;
            }
          });
        });
        
        return Object.entries(allCategories).map(([name, amount]) => ({
          name,
          amount: -amount, // Negative for expenses
        }));
      }),
    taxSummary: t.procedure
      .input(z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.taxSummary: Returning mock tax data");
        return {
          data: [
            { category: "Income Tax", amount: 18175, currency: "USD" },
            { category: "Sales Tax", amount: 5452, currency: "USD" },
          ],
          summary: { total: 23627, currency: "USD" }
        };
      }),
    revenueForecast: t.procedure
      .input(z.object({
        months: z.number().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        forecastMonths: z.number().optional(),
        currency: z.string().optional(),
        revenueType: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.revenueForecast: Returning forecast");
        // RevenueForecastCard expects: { historical, forecast, summary, meta }
        return {
          historical: [
            { date: "2026-01", value: 45000 },
            { date: "2026-02", value: 52000 },
            { date: "2026-03", value: 48000 },
            { date: "2026-04", value: 61000 },
          ],
          forecast: [
            { date: "2026-05", value: 54000, optimistic: 62000, pessimistic: 48000, confidence: 75 },
            { date: "2026-06", value: 58000, optimistic: 66000, pessimistic: 51000, confidence: 70 },
            { date: "2026-07", value: 52000, optimistic: 59000, pessimistic: 46000, confidence: 65 },
          ],
          summary: { 
            totalProjectedRevenue: 164000,
            currency: "USD" 
          },
          meta: {
            confidenceScore: 70
          }
        };
      }),
    burn: t.procedure.query(() => {
      console.log("[tRPC] reports.burn: Returning burn rate");
      return {
        monthly: 30500,
        currency: "USD",
      };
    }),
    burnRate: t.procedure
      .input(z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        currency: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.burnRate: Returning burn rate");
        return mockData.mockBurnRate;
      }),
    runway: t.procedure
      .input(z.object({
        currency: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.runway: Returning runway");
        // RunwayCard expects: { months, medianBurn }
        return { 
          months: 6.2,
          medianBurn: 30500
        };
      }),
    getAccountBalances: t.procedure
      .input(z.object({
        currency: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] reports.getAccountBalances: Returning account balances");
        // CashBalanceCard expects: { result: { totalBalance, currency, accountBreakdown } }
        return {
          result: {
            totalBalance: 45230.50,
            currency: "USD",
            accountBreakdown: [
              { 
                id: "acc_1", 
                name: "Chase Business Checking", 
                balance: 25430.50, 
                convertedBalance: 25430.50,
                currency: "USD" 
              },
              { 
                id: "acc_2", 
                name: "Wells Fargo Savings", 
                balance: 19800.00, 
                convertedBalance: 19800.00,
                currency: "USD" 
              },
            ]
          }
        };
      }),
    getByLinkId: t.procedure
      .input(z.object({ linkId: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] reports.getByLinkId: Starting query for linkId:", input.linkId);
        return null;
      }),
  }),

  // Documents (Vault)
  documents: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      console.log("[tRPC] documents.list: Returning mock vault files");
      return mockData.mockVaultDocuments;
    }),
    get: t.procedure
      .input(z.object({
        sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).nullable().optional(),
        folders: z.array(z.string()).nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        q: z.string().nullable().optional(),
        pageSize: z.number().nullable().optional(),
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        direction: z.string().nullable().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] documents.get: Returning mock vault files with input:", input);
        let filtered = [...mockData.mockVaultDocuments];
        
        if (input?.folders && input.folders.length > 0) {
          filtered = filtered.filter(file => input.folders!.includes(file.folderId));
        }
        
        return {
          data: filtered,
          meta: { cursor: null, hasMore: false }
        };
      }),
    signedUrls: t.procedure
      .input(z.object({
        fileIds: z.array(z.string()),
      }))
      .mutation(({ input }) => {
        console.log("[tRPC] documents.signedUrls: Generating URLs for files:", input.fileIds);
        return input.fileIds.map(id => ({
          id,
          url: `https://storage.example.com/files/${id}?signed=true`
        }));
      }),
    getRelatedDocuments: t.procedure
      .input(z.object({
        documentId: z.string(),
        pageSize: z.number().optional(),
      }))
      .query(({ input }) => {
        console.log("[tRPC] documents.getRelatedDocuments: Finding related documents");
        const related = mockData.mockVaultDocuments
          .filter(f => f.id !== input.documentId)
          .slice(0, input.pageSize || 12);
        return related;
      }),
    checkAttachments: t.procedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] documents.checkAttachments: Checking attachments for:", input.id);
        return { hasAttachments: false, count: 0 };
      }),
  }),

  // Inbox
  inbox: t.router({
    list: t.procedure
      .input(z.object({
        status: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] inbox.list: Returning mock inbox items");
        let filtered = [...mockData.mockInboxMessages];
        
        if (input?.status === "unread") {
          filtered = filtered.filter(item => !item.isRead);
        } else if (input?.status === "read") {
          filtered = filtered.filter(item => item.isRead);
        }
        
        return filtered;
      }),
    get: t.procedure
      .input(z.object({
        status: z.string().optional(),
        sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional(),
        q: z.string().optional(),
        pageSize: z.number().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] inbox.get: Returning mock inbox items with input:", input);
        let filtered = [...mockData.mockInboxMessages];
        
        if (input?.status === "unread") {
          filtered = filtered.filter(item => !item.isRead);
        } else if (input?.status === "read") {
          filtered = filtered.filter(item => item.isRead);
        }
        
        return {
          data: filtered,
          meta: { cursor: null, hasMore: false }
        };
      }),
    count: t.procedure.query(() => {
      console.log("[tRPC] inbox.count: Returning inbox count");
      return {
        pending: mockData.mockInboxMessages.filter(i => !i.isRead).length,
        total: mockData.mockInboxMessages.length
      };
    }),
  }),

  // Apps
  apps: t.router({
    get: t.procedure
      .input(z.object({
        tab: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] apps.get: Returning mock apps");
        if (input?.tab === "installed") {
          return mockData.mockApps.filter(app => app.connected);
        }
        return mockData.mockApps;
      }),
  }),

  // Connectors
  connectors: t.router({
    connections: t.procedure.query(() => {
      console.log("[tRPC] connectors.connections: Returning mock connections");
      return mockData.mockApps.filter(app => app.connected);
    }),
    list: t.procedure.query(() => {
      console.log("[tRPC] connectors.list: Returning mock apps");
      return mockData.mockApps;
    }),
    detail: t.procedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => {
        console.log("[tRPC] connectors.detail: Getting details for:", input.slug);
        const app = mockData.mockApps.find(a =>
          a.name.toLowerCase().replace(/\s+/g, '-') === input.slug
        );
        return app || null;
      }),
  }),

  // Tags (for transactions)
  tags: t.router({
    get: t.procedure.query(() => {
      console.log("[tRPC] tags.get: Returning mock tags");
      return [
        { id: "tag_1", name: "income", color: "#3b82f6" },
        { id: "tag_2", name: "infrastructure", color: "#10b981" },
        { id: "tag_3", name: "hr", color: "#f59e0b" },
      ];
    }),
  }),

  // Document Tags (for vault)
  documentTags: t.router({
    get: t.procedure.query(() => {
      console.log("[tRPC] documentTags.get: Returning mock document tags");
      return [
        { id: "tag_4", name: "contract", color: "#3b82f6" },
        { id: "tag_5", name: "specifications", color: "#10b981" },
        { id: "tag_6", name: "finance", color: "#f59e0b" },
        { id: "tag_7", name: "report", color: "#8b5cf6" },
      ];
    }),
  }),

  // Inbox Accounts
  inboxAccounts: t.router({
    get: t.procedure.query(() => {
      console.log("[tRPC] inboxAccounts.get: Returning mock inbox accounts");
      return [
        {
          id: "inbox_acc_1",
          email: "invoices@quadra.com",
          provider: "gmail",
          status: "connected",
          createdAt: "2025-08-01T00:00:00.000Z",
        }
      ];
    }),
  }),

  // Invoice Payments
  invoicePayments: t.router({
    stripeStatus: t.procedure.query(() => {
      console.log("[tRPC] invoicePayments.stripeStatus: Returning Stripe status");
      return {
        isConnected: true,
        accountId: "acct_mock123",
        chargesEnabled: true,
      };
    }),
  }),

  // OAuth Applications
  oauthApplications: t.router({
    authorized: t.procedure.query(() => {
      console.log("[tRPC] oauthApplications.authorized: Returning authorized apps");
      return [];
    }),
    list: t.procedure.query(() => {
      console.log("[tRPC] oauthApplications.list: Returning OAuth applications list");
      return [];
    }),
  }),

  // Search
  search: t.router({
    global: t.procedure
      .input(z.object({ query: z.string().nullable().optional() }).optional())
      .query(() => {
        console.log("[tRPC] search.global: Returning empty search results");
        return [];
      }),
  }),

  // Billing
  billing: t.router({
    orders: t.procedure
      .input(z.object({
        pageSize: z.number().optional(),
        direction: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        console.log("[tRPC] billing.orders: Returning mock billing orders with input:", input);
        
        // Mock billing orders based on the plans
        const orders = [
          {
            id: "order_1",
            planId: "plan_pro",
            planName: "Pro",
            amount: {
              amount: 2900, // Amount in cents
              currency: "USD",
            },
            status: "paid",
            createdAt: new Date("2026-04-01T00:00:00.000Z"),
            periodStart: new Date("2026-04-01T00:00:00.000Z"),
            periodEnd: new Date("2026-05-01T00:00:00.000Z"),
            invoiceUrl: "#",
            product: {
              id: "plan_pro",
              name: "Pro Plan",
            },
          },
          {
            id: "order_2",
            planId: "plan_pro",
            planName: "Pro",
            amount: {
              amount: 2900,
              currency: "USD",
            },
            status: "paid",
            createdAt: new Date("2026-03-01T00:00:00.000Z"),
            periodStart: new Date("2026-03-01T00:00:00.000Z"),
            periodEnd: new Date("2026-04-01T00:00:00.000Z"),
            invoiceUrl: "#",
            product: {
              id: "plan_pro",
              name: "Pro Plan",
            },
          },
          {
            id: "order_3",
            planId: "plan_pro",
            planName: "Pro",
            amount: {
              amount: 2900,
              currency: "USD",
            },
            status: "paid",
            createdAt: new Date("2026-02-01T00:00:00.000Z"),
            periodStart: new Date("2026-02-01T00:00:00.000Z"),
            periodEnd: new Date("2026-03-01T00:00:00.000Z"),
            invoiceUrl: "#",
            product: {
              id: "plan_pro",
              name: "Pro Plan",
            },
          },
        ];
        
        return {
          data: orders,
          meta: { cursor: null, hasMore: false }
        };
      }),
    getActiveSubscription: t.procedure.query(() => {
      console.log("[tRPC] billing.getActiveSubscription: Returning active subscription");
      
      // Return the current Pro plan subscription
      const activePlan = mockData.mockPlans.find(p => p.isCurrent);
      
      if (!activePlan) {
        return null;
      }
      
      return {
        id: "sub_1",
        planId: activePlan.id,
        planName: activePlan.name,
        amount: activePlan.price,
        currency: activePlan.currency,
        interval: activePlan.interval,
        status: "active",
        currentPeriodStart: "2026-04-01T00:00:00.000Z",
        currentPeriodEnd: activePlan.currentPeriodEnd || "2026-05-01T00:00:00.000Z",
        cancelAtPeriodEnd: false,
        createdAt: "2025-01-01T00:00:00.000Z",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
