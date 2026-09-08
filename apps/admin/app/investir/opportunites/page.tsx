import { prisma } from "@odthan/database";

export default async function AdminOpportunitiesPage() {
  const opportunities = await prisma.investmentOpportunity.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { investments: true } } },
  });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-white">Opportunités d&apos;investissement</h1>
      <p className="mb-8 text-sm text-[#A0A0A0]">
        Toute nouvelle opportunité est désactivée par défaut. Ne l&apos;activer qu&apos;après
        validation juridique et réglementaire complète.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-[#0D0D0D] text-left text-[#A0A0A0]">
            <tr>
              <th className="p-4">Titre</th>
              <th className="p-4">Minimum</th>
              <th className="p-4">Durée</th>
              <th className="p-4">Objectif</th>
              <th className="p-4">Investissements</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id} className="border-t border-[#D4AF37]/10">
                <td className="p-4 text-white">{o.title}</td>
                <td className="p-4 text-[#A0A0A0]">{Number(o.minimum).toLocaleString()} {o.currency}</td>
                <td className="p-4 text-[#A0A0A0]">{o.termMonths} mois</td>
                <td className="p-4 text-[#A0A0A0]">{Number(o.target).toLocaleString()} {o.currency}</td>
                <td className="p-4 text-[#A0A0A0]">{o._count.investments}</td>
                <td className="p-4">
                  <span className={o.active ? "text-green-400" : "text-red-400"}>
                    {o.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
