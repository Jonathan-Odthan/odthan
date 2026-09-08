import { prisma } from "@odthan/database";

/**
 * RÈGLE IMPORTANTE :
 * Une commission n'est JAMAIS créée automatiquement sur un simple clic.
 * Elle doit être liée à un événement commercial défini — ici, le passage
 * d'un AutoLead au statut WON (vente confirmée par un administrateur
 * ou un partenaire autorisé).
 */
export async function createCommissionForWonLead(params: {
  leadId: string;
  amount: number;
  currency?: string;
}) {
  const lead = await prisma.autoLead.findUniqueOrThrow({
    where: { id: params.leadId },
    include: { affiliate: true },
  });

  if (lead.status !== "WON") {
    throw new Error("Une commission ne peut être créée que pour un lead au statut WON.");
  }

  if (!lead.affiliateId) {
    throw new Error("Ce lead n'est rattaché à aucun affilié — aucune commission à créer.");
  }

  // Évite les doublons : une commission par lead.
  const existing = await prisma.commission.findUnique({ where: { leadId: lead.id } });
  if (existing) return existing;

  return prisma.commission.create({
    data: {
      affiliateId: lead.affiliateId,
      leadId: lead.id,
      amount: params.amount,
      currency: params.currency ?? "USD",
      status: "PENDING",
    },
  });
}

export async function getAffiliateDashboardStats(affiliateId: string) {
  const [clicks, leads, qualifiedLeads, wonLeads, commissions] = await Promise.all([
    prisma.affiliateClick.count({ where: { affiliateId } }),
    prisma.autoLead.count({ where: { affiliateId } }),
    prisma.autoLead.count({ where: { affiliateId, status: { in: ["QUALIFIED", "QUOTED", "WON"] } } }),
    prisma.autoLead.count({ where: { affiliateId, status: "WON" } }),
    prisma.commission.findMany({ where: { affiliateId } }),
  ]);

  const sumByStatus = (status: string) =>
    commissions
      .filter((c) => c.status === status)
      .reduce((sum, c) => sum + Number(c.amount), 0);

  return {
    clicks,
    leads,
    qualifiedLeads,
    sales: wonLeads,
    commissionPending: sumByStatus("PENDING"),
    commissionApproved: sumByStatus("APPROVED"),
    commissionPaid: sumByStatus("PAID"),
  };
}
