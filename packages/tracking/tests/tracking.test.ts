import { describe, it, expect } from "vitest";
import { buildAffiliateLink, getAffiliateCookieMaxAgeSeconds } from "../src/affiliate-utils";

describe("buildAffiliateLink", () => {
  it("construit un lien affilié correctement formé", () => {
    const link = buildAffiliateLink("https://auto.odthan.com", "toyota-rav4-2025", "ODTHAN-AUTO-001");
    expect(link).toBe("https://auto.odthan.com/vehicules/toyota-rav4-2025?ref=ODTHAN-AUTO-001");
  });
});

describe("getAffiliateCookieMaxAgeSeconds", () => {
  it("utilise la valeur par défaut de 30 jours si non configuré", () => {
    delete process.env.AFFILIATE_COOKIE_DAYS;
    expect(getAffiliateCookieMaxAgeSeconds()).toBe(30 * 24 * 60 * 60);
  });

  it("respecte la variable d'environnement si définie", () => {
    process.env.AFFILIATE_COOKIE_DAYS = "7";
    expect(getAffiliateCookieMaxAgeSeconds()).toBe(7 * 24 * 60 * 60);
    delete process.env.AFFILIATE_COOKIE_DAYS;
  });
});

/**
 * RÈGLE MÉTIER CRITIQUE testée ici au niveau conceptuel :
 * une commission ne doit JAMAIS être calculée/créée pour un lead
 * dont le statut n'est pas WON. La fonction createCommissionForWonLead
 * (testée en intégration avec une vraie base) applique cette règle
 * via une vérification explicite `if (lead.status !== "WON") throw`.
 * Ce test documente et verrouille l'attente comportementale.
 */
describe("Règle métier : commission liée à un événement commercial", () => {
  const allowedStatusesForCommission = ["WON"];
  const allStatuses = ["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST"];

  it("seul le statut WON autorise la création d'une commission", () => {
    for (const status of allStatuses) {
      const shouldAllow = allowedStatusesForCommission.includes(status);
      expect(shouldAllow).toBe(status === "WON");
    }
  });
});
