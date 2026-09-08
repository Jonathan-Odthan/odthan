import type { PaymentProvider, CreatePaymentParams, CreatePaymentResult, VerifyPaymentResult, RefundPaymentParams } from "../provider";

/**
 * Intégration Stripe. Nécessite STRIPE_SECRET_KEY.
 * Installer le SDK officiel ("stripe") avant utilisation en production :
 *   npm install stripe --workspace=@odthan/payments
 */
export class StripeProvider implements PaymentProvider {
  name = "stripe";

  private assertConfigured() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe n'est pas configuré. Renseignez STRIPE_SECRET_KEY.");
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    this.assertConfigured();
    // TODO : const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({...});
    throw new Error("Intégration Stripe réelle à finaliser avec le SDK officiel.");
  }

  async verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    this.assertConfigured();
    throw new Error("Vérification Stripe à implémenter (stripe.paymentIntents.retrieve).");
  }

  async refundPayment(params: RefundPaymentParams): Promise<{ success: boolean }> {
    this.assertConfigured();
    throw new Error("Remboursement Stripe à implémenter (stripe.refunds.create).");
  }

  async getPaymentStatus(providerRef: string) {
    const result = await this.verifyPayment(providerRef);
    return result.status;
  }
}
