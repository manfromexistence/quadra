// Mock Stripe JS for build compatibility
export interface Appearance {
  theme?: 'stripe' | 'night' | 'flat';
  variables?: Record<string, string>;
}

export const loadStripe = async (publishableKey: string) => {
  return {
    elements: () => ({
      create: () => null,
      getElement: () => null,
    }),
    confirmPayment: async () => ({ error: null }),
    createPaymentMethod: async () => ({ error: null, paymentMethod: null }),
  };
};