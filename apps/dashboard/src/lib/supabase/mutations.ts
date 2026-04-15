// Mock mutations for build compatibility
export async function updateBankConnection(connectionId: string, data: any) {
  // Return a mock successful update
  return {
    id: connectionId,
    ...data,
    updated_at: new Date().toISOString(),
  };
}