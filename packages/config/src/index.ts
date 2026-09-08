/**
 * ODTHAN — Configuration centrale partagée par toutes les applications.
 */

export const ODTHAN_DOMAINS = {
  web: "https://www.odthan.com",
  auto: "https://auto.odthan.com",
  business: "https://business.odthan.com",
  investir: "https://investir.odthan.com",
  admin: "https://admin.odthan.com",
  account: "https://account.odthan.com",
} as const;

/**
 * Détecte quel module correspond au hostname courant.
 * Utile dans un éventuel middleware de routage multi-domaines.
 */
export function resolveAppFromHostname(hostname: string): keyof typeof ODTHAN_DOMAINS {
  if (hostname.startsWith("auto.")) return "auto";
  if (hostname.startsWith("business.")) return "business";
  if (hostname.startsWith("investir.")) return "investir";
  if (hostname.startsWith("admin.")) return "admin";
  if (hostname.startsWith("account.")) return "account";
  return "web";
}

export * from "./types";
import type { SupportedLocale, SupportedCurrency } from "./types";

export const DEFAULT_LOCALE: SupportedLocale = "fr";
export const DEFAULT_CURRENCY: SupportedCurrency = "USD";

/**
 * Formate un montant avec sa devise. Ne convertit jamais silencieusement
 * entre devises — un taux de change réel doit provenir d'un service
 * configurable dédié si la conversion est activée.
 */
export function formatAmount(amount: number, currency: SupportedCurrency, locale: SupportedLocale = DEFAULT_LOCALE) {
  const localeMap: Record<SupportedLocale, string> = { fr: "fr-FR", ht: "fr-HT", es: "es-ES" };
  try {
    return new Intl.NumberFormat(localeMap[locale], { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export * from "./locales";
