import { prisma } from "@odthan/database";
import { AFFILIATE_COOKIE_NAME, DEFAULT_AFFILIATE_COOKIE_DAYS, getAffiliateCookieMaxAgeSeconds, buildAffiliateLink } from "./affiliate-utils";

// Ré-exportées ici pour ne pas casser les imports existants
// (`from "@odthan/tracking/affiliate"` ou via l'index du package).
export { AFFILIATE_COOKIE_NAME, DEFAULT_AFFILIATE_COOKIE_DAYS, getAffiliateCookieMaxAgeSeconds, buildAffiliateLink };

/**
 * Enregistre un clic d'affiliation. Ne crée JAMAIS de commission —
 * la commission n'est générée que lors d'un événement commercial
 * (vente confirmée), voir @odthan/tracking/commission.
 */
export async function recordAffiliateClick(params: {
  affiliateCode: string;
  vehicleId?: string;
  sessionId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: params.affiliateCode },
  });

  if (!affiliate || !affiliate.active) {
    return null;
  }

  return prisma.affiliateClick.create({
    data: {
      affiliateId: affiliate.id,
      vehicleId: params.vehicleId,
      sessionId: params.sessionId,
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

/**
 * Génère le code affilié unique suivant, au format ODTHAN-AUTO-XXX.
 */
export async function generateAffiliateCode(): Promise<string> {
  const count = await prisma.affiliate.count();
  const next = (count + 1).toString().padStart(3, "0");
  return `ODTHAN-AUTO-${next}`;
}
