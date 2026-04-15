import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // Overview
  overview: t.router({
    summary: t.procedure.query(async ({ ctx }) => {
      try {
        const [invoices, bankAccounts] = await Promise.all([
          ctx.db.select().from(schema.invoices).where(eq(schema.invoices.teamId, ctx.teamId)),
          ctx.db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.teamId, ctx.teamId)),
        ]);
        
        const openInvoices = invoices.filter(inv => ['draft', 'pending', 'overdue', 'unpaid'].includes(inv.status || ''));
        const totalAmount = openInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        
        return {
          openInvoices: {
            count: openInvoices.length,
            totalAmount,
            currency: "USD",
          },
          unbilledTime: {
            totalDuration: 0,
            totalAmount: 0,
            projectCount: 0,
            currency: "USD",
          },
          inboxPending: {
            count: 0,
          },
          transactionsToReview: {
            count: 0,
          },
          cashBalance: {
            totalBalance,
            currency: "USD",
            accountCount: bankAccounts.length,
          },
          runway: 0,
        };
      } catch (error) {
        console.error("[tRPC] overview.summary error:", error);
        throw error;
      }
    }),
  }),

  // User
  user: t.router({
    me: t.procedure.query(async ({ ctx }) => {
      try {
        if (!ctx.userId) {
          console.log("[tRPC] user.me: No userId in context");
          return null;
        }
        const users = await ctx.db.select().from(schema.user).where(eq(schema.user.id, ctx.userId)).limit(1);
        console.log("[tRPC] user.me: Found user:", users[0]?.email);
        return users[0] || null;
      } catch (error) {
        console.error("[tRPC] user.me error:", error);
        throw error;
      }
    }),
  }),

  // Team
  team: t.router({
    current: t.procedure.query(async ({ ctx }) => {
      try {
        const teams = await ctx.db.select().from(schema.teams).where(eq(schema.teams.id, ctx.teamId)).limit(1);
        console.log("[tRPC] team.current: Found team:", teams[0]?.name);
        return teams[0] || null;
      } catch (error) {
        console.error("[tRPC] team.current error:", error);
        throw error;
      }
    }),
    list: t.procedure.query(async ({ ctx }) => {
      try {
        if (!ctx.userId) return [];
        const teams = await ctx.db.select().from(schema.teams);
        console.log("[tRPC] team.list: Found", teams.length, "teams");
        return teams;
      } catch (error) {
        console.error("[tRPC] team.list error:", error);
        throw error;
      }
    }),
    connectionStatus: t.procedure.query(() => null),
  }),

  // Invoice
  invoice: t.router({
    defaultSettings: t.procedure.query(() => ({
      template: "default",
      currency: "USD",
      dueDate: 30,
      from: {
        name: "Quadra Construction",
        email: "team@quadra.com",
      },
    })),
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
        throw error;
      }
    }),
  }),

  // Transaction Categories
  transactionCategories: t.router({
    get: t.procedure.query(() => []),
  }),

  // Bank Accounts
  bankAccounts: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] bankAccounts.list: Found", result.length, "accounts");
        return result;
      } catch (error) {
        console.error("[tRPC] bankAccounts.list error:", error);
        throw error;
      }
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
        throw error;
      }
    }),
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
        throw error;
      }
    }),
  }),

  trackerEntries: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.trackerEntries).where(eq(schema.trackerEntries.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] trackerEntries.list: Found", result.length, "entries");
        return result;
      } catch (error) {
        console.error("[tRPC] trackerEntries.list error:", error);
        throw error;
      }
    }),
    getTimerStatus: t.procedure.query(() => null),
  }),

  // Documents/Vault
  documents: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.vaultFiles).where(eq(schema.vaultFiles.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] documents.list: Found", result.length, "files");
        return result;
      } catch (error) {
        console.error("[tRPC] documents.list error:", error);
        throw error;
      }
    }),
  }),

  // Inbox
  inbox: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      try {
        const result = await ctx.db.select().from(schema.inboxItems).where(eq(schema.inboxItems.teamId, ctx.teamId)).limit(50);
        console.log("[tRPC] inbox.list: Found", result.length, "items");
        return result;
      } catch (error) {
        console.error("[tRPC] inbox.list error:", error);
        throw error;
      }
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
      .query(() => {
        console.log("[tRPC] notifications.list: Returning empty array");
        return [];
      }),
  }),

  // Connectors
  connectors: t.router({
    connections: t.procedure.query(() => {
      console.log("[tRPC] connectors.connections: Returning empty array");
      return [];
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
});

export type AppRouter = typeof appRouter;
