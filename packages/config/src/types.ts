export const SUPPORTED_LOCALES = ["fr", "ht", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_CURRENCIES = ["USD", "HTG", "DOP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
