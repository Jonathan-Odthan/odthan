import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@odthan/auth";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Demandé",
  PENDING: "En attente",
  ACTIVE: "Actif",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export default async function InvestorDashboardPage() {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("https://www.odthan.com/connexion");

  const investments = await prisma.investment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { opportunity: true, transactions: true },
  });

  const totalInvested = investments
    .filter((i) => i.status === "ACTIVE" || i.status === "COMPLETED")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">Mon portefeuille</h1>
      <p className="mb-10 text-[#A0A0A0]">Suivez vos demandes et investissements actifs.</p>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#D4AF37]">{totalInvested.toLocaleString()} $</div>
          <div className="text-sm text-[#A0A0A0]">Capital investi (actif)</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[#D4AF37]">{investments.length}</div>
          <div className="text-sm text-[#A0A0A0]">Investissements totaux</div>
        </Card>
      </div>

      {investments.length === 0 ? (
        <Card><p className="text-[#A0A0A0]">Aucun investissement pour le moment.</p></Card>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <Card key={inv.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#F1D77A]">{inv.opportunity.title}</h3>
                  <p className="text-sm text-[#A0A0A0]">
                    {Number(inv.amount).toLocaleString()} {inv.currency}
                  </p>
                </div>
                <span className="rounded-full border border-[#D4AF37]/40 px-3 py-1 text-xs text-[#D4AF37]">
                  {STATUS_LABELS[inv.status] ?? inv.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
