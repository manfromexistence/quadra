// Mock cached queries for build compatibility
export async function getSession() {
  // Return a mock session structure
  return {
    access_token: "mock-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: "bearer",
    user: {
      id: "mock-user-id",
      email: "mock@example.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  };
}