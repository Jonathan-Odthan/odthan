import { prisma } from "@odthan/database";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  APPROVED: "text-blue-400",
  PAID: "text-green-400",
  REJECTED: "text-red-400",
};

export default async function AdminCommissionsPage() {
  const commissions = await prisma.commission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      affiliate: { include: { user: { include: { profile: true } } } },
      lead: { include: { vehicle: true } },
    },
  });

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Commissions</h1>

      <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-[#0D0D0D] text-left text-[#A0A0A0]">
            <tr>
              <th className="p-4">Affilié</th>
              <th className="p-4">Véhicule</th>
              <th className="p-4">Montant</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t border-[#D4AF37]/10">
                <td className="p-4 text-white">
                  {c.affiliate.user.profile
                    ? `${c.affiliate.user.profile.firstName} ${c.affiliate.user.profile.lastName}`
                    : c.affiliate.code}
                </td>
                <td className="p-4 text-[#A0A0A0]">{c.lead.vehicle.name}</td>
                <td className="p-4 text-[#D4AF37]">{Number(c.amount).toLocaleString()} {c.currency}</td>
                <td className={`p-4 font-semibold ${STATUS_COLORS[c.status]}`}>{c.status}</td>
                <td className="p-4 text-[#A0A0A0]">{c.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
