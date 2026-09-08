import { prisma } from "@odthan/database";
import type { PaymentProvider, CreatePaymentParams, CreatePaymentResult, VerifyPaymentResult, RefundPaymentParams } from "../provider";

/**
 * Paiement manuel : utilisé lorsque le client règle hors ligne
 * (virement bancaire, espèces, chèque). Le statut est confirmé
 * manuellement par un administrateur depuis /admin.
 */
export class ManualPaymentProvider implements PaymentProvider {
  name = "manual";

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const payment = await prisma.payment.create({
      data: {
        userId: params.userId,
        provider: "manual",
        amount: params.amount,
        currency: params.currency,
        status: "PENDING",
      },
    });

    return {
      paymentId: payment.id,
      providerRef: payment.id,
      status: "PENDING",
    };
  }

  async verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: providerRef } });
    return {
      providerRef: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
    };
  }

  async refundPayment(params: RefundPaymentParams): Promise<{ success: boolean }> {
    await prisma.payment.update({
      where: { id: params.providerRef },
      data: { status: "REFUNDED" },
    });
    return { success: true };
  }

  async getPaymentStatus(providerRef: string) {
    const result = await this.verifyPayment(providerRef);
    return result.status;
  }

  /** Réservé à l'administration : confirme manuellement un paiement reçu. */
  async confirmManually(paymentId: string) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status: "COMPLETED" },
    });
  }
}
