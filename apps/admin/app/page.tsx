import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    businessProjects,
    autoLeads,
    wonLeads,
    affiliatesCount,
    commissions,
    payments,
    investments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.businessProject.count(),
    prisma.autoLead.count(),
    prisma.autoLead.count({ where: { status: "WON" } }),
    prisma.affiliate.count(),
    prisma.commission.findMany(),
    prisma.payment.findMany({ where: { status: "COMPLETED" } }),
    prisma.investment.count(),
  ]);

  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const kpis = [
    { label: "Utilisateurs totaux", value: totalUsers },
    { label: "Nouveaux (30j)", value: newUsers },
    { label: "Projets Business", value: businessProjects },
    { label: "Leads Auto", value: autoLeads },
    { label: "Ventes Auto", value: wonLeads },
    { label: "Affiliés", value: affiliatesCount },
    { label: "Commissions ($)", value: totalCommissions.toFixed(2) },
    { label: "Revenus ($)", value: totalRevenue.toFixed(2) },
    { label: "Investissements", value: investments },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="text-2xl font-bold text-[#D4AF37]">{kpi.value}</div>
            <div className="text-sm text-[#A0A0A0]">{kpi.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
