import type { PaymentProvider } from "./provider";
import { PayPalProvider } from "./providers/paypal";
import { StripeProvider } from "./providers/stripe";
import { ManualPaymentProvider } from "./providers/manual";

export type PaymentProviderName = "paypal" | "stripe" | "manual";

export function getPaymentProvider(name: PaymentProviderName): PaymentProvider {
  switch (name) {
    case "paypal":
      return new PayPalProvider();
    case "stripe":
      return new StripeProvider();
    case "manual":
      return new ManualPaymentProvider();
    default:
      throw new Error(`Fournisseur de paiement inconnu: ${name}`);
  }
}

export * from "./provider";
