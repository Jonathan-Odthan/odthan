/**
 * ODTHAN — Architecture de paiement extensible.
 * Chaque prestataire (PayPal, Stripe, paiement manuel...) implémente
 * cette interface commune. L'application n'appelle jamais un SDK
 * directement : elle passe toujours par PaymentProvider.
 */

export interface CreatePaymentParams {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentResult {
  paymentId: string;
  providerRef: string;
  redirectUrl?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface VerifyPaymentResult {
  providerRef: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  amount: number;
  currency: string;
}

export interface RefundPaymentParams {
  providerRef: string;
  amount?: number; // remboursement partiel si fourni
}

export interface PaymentProvider {
  name: string;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  verifyPayment(providerRef: string): Promise<VerifyPaymentResult>;
  refundPayment(params: RefundPaymentParams): Promise<{ success: boolean }>;
  getPaymentStatus(providerRef: string): Promise<VerifyPaymentResult["status"]>;
}
