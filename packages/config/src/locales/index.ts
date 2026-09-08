import { fr } from "./fr";
import { ht } from "./ht";
import { es } from "./es";
import type { SupportedLocale } from "../types";

const dictionaries = { fr, ht, es };

export function getDictionary(locale: SupportedLocale) {
  return dictionaries[locale] ?? dictionaries.fr;
}

export * from "./fr";
