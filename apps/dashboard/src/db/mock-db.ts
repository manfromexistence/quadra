// Mock database implementation that mimics Drizzle ORM interface
// This allows switching between mock data and real database without changing application code

import { eq } from "drizzle-orm";
import * as schema from "./schema";
import * as mockData from "./mock-data";

// Type for mock query builder
type MockQueryBuilder<T> = {
  where: (condition: unknown) => MockQueryBuilder<T>;
  limit: (count: number) => MockQueryBuilder<T>;
  offset: (count: number) => MockQueryBuilder<T>;
  orderBy: (...args: unknown[]) => MockQueryBuilder<T>;
  execute: () => Promise<T[]>;
  then: (resolve: (value: T[]) => void, reject?: (reason: unknown) => void) => Promise<T[]>;
};

// Mock database class
class MockDatabase {
  private mockEnabled = true;

  // User queries
  query = {
    user: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        let users = [...mockData.mockUsers];
        
        if (options?.limit) {
          users = users.slice(0, options.limit);
        }
        
        return users;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockUsers[0] || null;
      },
    },
    session: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockSessions;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockSessions[0] || null;
      },
    },
    theme: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockThemes;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockThemes[0] || null;
      },
    },
    subscription: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockSubscriptions;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockSubscriptions[0] || null;
      },
    },
    aiUsage: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockAiUsage;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockAiUsage[0] || null;
      },
    },
    projects: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockProjects;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockProjects[0] || null;
      },
    },
    projectMembers: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockProjectMembers;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockProjectMembers[0] || null;
      },
    },
    documents: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocuments;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocuments[0] || null;
      },
    },
    documentVersions: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocumentVersions;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocumentVersions[0] || null;
      },
    },
    documentComments: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocumentComments;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocumentComments[0] || null;
      },
    },
    notifications: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockNotifications;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockNotifications[0] || null;
      },
    },
    activityLog: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockActivityLog;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockActivityLog[0] || null;
      },
    },
    transmittals: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTransmittals;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTransmittals[0] || null;
      },
    },
    transmittalDocuments: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTransmittalDocuments;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTransmittalDocuments[0] || null;
      },
    },
    documentWorkflows: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocumentWorkflows;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockDocumentWorkflows[0] || null;
      },
    },
    workflowSteps: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockWorkflowSteps;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockWorkflowSteps[0] || null;
      },
    },
    teams: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTeams;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTeams[0] || null;
      },
    },
    bankAccounts: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockBankAccounts;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockBankAccounts[0] || null;
      },
    },
    transactions: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTransactions;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTransactions[0] || null;
      },
    },
    customers: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockCustomers;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockCustomers[0] || null;
      },
    },
    invoices: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockInvoices;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockInvoices[0] || null;
      },
    },
    trackerProjects: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTrackerProjects;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTrackerProjects[0] || null;
      },
    },
    trackerEntries: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTrackerEntries;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockTrackerEntries[0] || null;
      },
    },
    vaultFiles: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockVaultFiles;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockVaultFiles[0] || null;
      },
    },
    inboxItems: {
      findMany: async (options?: { where?: unknown; limit?: number }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockInboxItems;
      },
      findFirst: async (options?: { where?: unknown }) => {
        if (!this.mockEnabled) throw new Error("Mock DB not enabled");
        return mockData.mockInboxItems[0] || null;
      },
    },
  };

  // Select queries
  select(fields?: unknown) {
    return {
      from: (table: unknown) => {
        const tableName = this.getTableName(table);
        return {
          where: (condition: unknown) => {
            // Extract the filter from the condition
            const data = this.getMockDataForTable(tableName);
            // For now, return all data - proper filtering would require parsing the condition
            return {
              limit: (count: number) => data.slice(0, count),
              then: (resolve: (value: unknown[]) => void) => {
                resolve(data);
                return Promise.resolve(data);
              },
            };
          },
          limit: (count: number) => {
            const data = this.getMockDataForTable(tableName);
            return data.slice(0, count);
          },
          then: (resolve: (value: unknown[]) => void) => {
            const data = this.getMockDataForTable(tableName);
            resolve(data);
            return Promise.resolve(data);
          },
        };
      },
    };
  }

  // Insert queries
  insert(table: unknown) {
    return {
      values: (values: unknown) => ({
        returning: () => Promise.resolve([values]),
        execute: () => Promise.resolve({ rowsAffected: 1 }),
      }),
    };
  }

  // Update queries
  update(table: unknown) {
    return {
      set: (values: unknown) => ({
        where: (condition: unknown) => ({
          returning: () => Promise.resolve([values]),
          execute: () => Promise.resolve({ rowsAffected: 1 }),
        }),
      }),
    };
  }

  // Delete queries
  delete(table: unknown) {
    return {
      where: (condition: unknown) => ({
        execute: () => Promise.resolve({ rowsAffected: 1 }),
      }),
    };
  }

  private getTableName(table: unknown): string {
    // Extract table name from schema
    if (table === schema.user) return "user";
    if (table === schema.session) return "session";
    if (table === schema.theme) return "theme";
    if (table === schema.subscription) return "subscription";
    if (table === schema.aiUsage) return "aiUsage";
    if (table === schema.projects) return "projects";
    if (table === schema.projectMembers) return "projectMembers";
    if (table === schema.documents) return "documents";
    if (table === schema.documentVersions) return "documentVersions";
    if (table === schema.documentComments) return "documentComments";
    if (table === schema.notifications) return "notifications";
    if (table === schema.activityLog) return "activityLog";
    if (table === schema.transmittals) return "transmittals";
    if (table === schema.transmittalDocuments) return "transmittalDocuments";
    if (table === schema.documentWorkflows) return "documentWorkflows";
    if (table === schema.workflowSteps) return "workflowSteps";
    if (table === schema.teams) return "teams";
    if (table === schema.bankAccounts) return "bankAccounts";
    if (table === schema.transactions) return "transactions";
    if (table === schema.customers) return "customers";
    if (table === schema.invoices) return "invoices";
    if (table === schema.trackerProjects) return "trackerProjects";
    if (table === schema.trackerEntries) return "trackerEntries";
    if (table === schema.vaultFiles) return "vaultFiles";
    if (table === schema.inboxItems) return "inboxItems";
    return "unknown";
  }

  private createMockQueryBuilder<T>(tableName: string): MockQueryBuilder<T> {
    const builder: MockQueryBuilder<T> = {
      where: (condition: unknown) => builder,
      limit: (count: number) => builder,
      offset: (count: number) => builder,
      orderBy: (...args: unknown[]) => builder,
      execute: async () => {
        return this.getMockDataForTable(tableName) as T[];
      },
      then: async (resolve, reject) => {
        try {
          const result = await builder.execute();
          resolve(result);
          return result;
        } catch (error) {
          if (reject) reject(error);
          throw error;
        }
      },
    };
    return builder;
  }

  private getMockDataForTable(tableName: string): unknown[] {
    switch (tableName) {
      case "user":
        return mockData.mockUsers;
      case "session":
        return mockData.mockSessions;
      case "theme":
        return mockData.mockThemes;
      case "subscription":
        return mockData.mockSubscriptions;
      case "aiUsage":
        return mockData.mockAiUsage;
      case "projects":
        return mockData.mockProjects;
      case "projectMembers":
        return mockData.mockProjectMembers;
      case "documents":
        return mockData.mockDocuments;
      case "documentVersions":
        return mockData.mockDocumentVersions;
      case "documentComments":
        return mockData.mockDocumentComments;
      case "notifications":
        return mockData.mockNotifications;
      case "activityLog":
        return mockData.mockActivityLog;
      case "transmittals":
        return mockData.mockTransmittals;
      case "transmittalDocuments":
        return mockData.mockTransmittalDocuments;
      case "documentWorkflows":
        return mockData.mockDocumentWorkflows;
      case "workflowSteps":
        return mockData.mockWorkflowSteps;
      case "teams":
        return mockData.mockTeams;
      case "bankAccounts":
        return mockData.mockBankAccounts;
      case "transactions":
        return mockData.mockTransactions;
      case "customers":
        return mockData.mockCustomers;
      case "invoices":
        return mockData.mockInvoices;
      case "trackerProjects":
        return mockData.mockTrackerProjects;
      case "trackerEntries":
        return mockData.mockTrackerEntries;
      case "vaultFiles":
        return mockData.mockVaultFiles;
      case "inboxItems":
        return mockData.mockInboxItems;
      default:
        return [];
    }
  }
}

export const mockDb = new MockDatabase();
