// Mock Stripe React components for build compatibility
import type { ReactNode } from "react";

export const Elements = ({ children }: { children: ReactNode }) => children;

export const PaymentElement = () => null;

export const useElements = () => ({
  submit: async () => ({ error: null }),
  getElement: () => null,
});

export const useStripe = () => ({
  confirmPayment: async () => ({ error: null }),
  createPaymentMethod: async () => ({ error: null, paymentMethod: null }),
  retrievePaymentIntent: async () => ({ error: null, paymentIntent: null }),
});
