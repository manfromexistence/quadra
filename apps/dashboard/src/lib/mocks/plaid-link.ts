// Mock Plaid Link for build compatibility
export const usePlaidLink = (config: any) => ({
  open: () => {},
  ready: true,
  error: null,
  exit: () => {},
});