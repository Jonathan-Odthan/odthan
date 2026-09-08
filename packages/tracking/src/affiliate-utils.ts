/**
 * ODTHAN — Fonctions pures liées à l'affiliation.
 *
 * IMPORTANT (architecture) : ce fichier NE DOIT JAMAIS importer
 * `@odthan/database`. Le fichier `affiliate.ts` du même dossier contient
 * les fonctions qui ont réellement besoin de Prisma. Cette séparation
 * permet de tester la logique pure (formatage de lien, calcul de durée
 * de cookie...) sans déclencher l'instanciation de PrismaClient, qui se
 * produit au chargement du module `@odthan/database` (singleton créé au
 * top-level). Mélanger les deux rendait impossible de tester une fonction
 * comme `buildAffiliateLink` sans une base de données disponible.
 */

export const AFFILIATE_COOKIE_NAME = "odthan_ref";
export const DEFAULT_AFFILIATE_COOKIE_DAYS = 30;

/**
 * Durée de survie du tracking d'affiliation, configurable via
 * la variable d'environnement AFFILIATE_COOKIE_DAYS.
 */
export function getAffiliateCookieMaxAgeSeconds(): number {
  const days = Number(process.env.AFFILIATE_COOKIE_DAYS ?? DEFAULT_AFFILIATE_COOKIE_DAYS);
  return days * 24 * 60 * 60;
}

/**
 * Construit l'URL affiliée complète pour un véhicule donné.
 */
export function buildAffiliateLink(baseUrl: string, vehicleSlug: string, affiliateCode: string) {
  return `${baseUrl}/vehicules/${vehicleSlug}?ref=${affiliateCode}`;
}
