// Mock Supabase client for build compatibility
export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signIn: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => ({ data: null, error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      verifyOtp: async () => ({ data: null, error: null }),
      mfa: {
        enroll: async () => ({ data: null, error: null }),
        challenge: async () => ({ data: null, error: null }),
        verify: async () => ({ data: null, error: null }),
        unenroll: async () => ({ data: null, error: null }),
        listFactors: async () => ({ data: [], error: null }),
        getAuthenticatorAssuranceLevel: async () => ({ data: null, error: null }),
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
        order: () => ({ limit: async () => ({ data: [], error: null }) }),
        limit: async () => ({ data: [], error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        download: async () => ({ data: null, error: null }),
        remove: async () => ({ data: null, error: null }),
        list: async () => ({ data: [], error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: async () => ({ data: null, error: null }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
    rpc: async () => ({ data: null, error: null }),
  };
}