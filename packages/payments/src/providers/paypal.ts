import type { PaymentProvider, CreatePaymentParams, CreatePaymentResult, VerifyPaymentResult, RefundPaymentParams } from "../provider";

/**
 * Intégration PayPal. Nécessite PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET
 * dans les variables d'environnement. Si elles sont absentes, les appels
 * lèvent une erreur explicite plutôt que de simuler un paiement.
 */
export class PayPalProvider implements PaymentProvider {
  name = "paypal";

  private assertConfigured() {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error(
        "PayPal n'est pas configuré. Renseignez PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET."
      );
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    this.assertConfigured();
    // TODO intégration réelle : appeler l'API PayPal Orders v2
    // via fetch("https://api-m.paypal.com/v2/checkout/orders", ...)
    // avec un token OAuth obtenu depuis PAYPAL_CLIENT_ID/SECRET.
    throw new Error("Intégration PayPal réelle à finaliser avec les identifiants du compte marchand.");
  }

  async verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    this.assertConfigured();
    throw new Error("Vérification PayPal à implémenter (GET /v2/checkout/orders/{id}).");
  }

  async refundPayment(params: RefundPaymentParams): Promise<{ success: boolean }> {
    this.assertConfigured();
    throw new Error("Remboursement PayPal à implémenter (POST /v2/payments/captures/{id}/refund).");
  }

  async getPaymentStatus(providerRef: string) {
    const result = await this.verifyPayment(providerRef);
    return result.status;
  }
}
