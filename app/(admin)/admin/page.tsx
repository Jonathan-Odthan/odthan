import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import StatCard from "@/components/ui/stat-card";
import { resolvePeriod, type PeriodKey } from "@/lib/utils/period";
import { formatMoney } from "@/lib/utils/format";
import { Download } from "lucide-react";

export const metadata = { title: "Rapports" };

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "3m", label: "3 mois" },
  { key: "year", label: "Annee" },
];

export default async function ReportsPage({ searchParams }: { searchParams: { period?: PeriodKey; from?: string; to?: string } }) {
  await requirePermission("reports.view");
  const period = searchParams.period || "30d";
  const { start, end } = resolvePeriod(period, searchParams.from, searchParams.to);

  const [revenue, paymentsCount, ordersCount, requestsCount, newClients, byService] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: start, lte: end }, status: "CONFIRMED" } }),
    prisma.payment.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.request.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.client.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.request.groupBy({
      by: ["serviceId"],
      _count: { _all: true },
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { _count: { serviceId: "desc" } },
      take: 10,
    }),
  ]);

  const services = await prisma.service.findMany({ where: { id: { in: byService.map((b) => b.serviceId) } } });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  const exportUrl = `/api/rapports/export?period=${period}${searchParams.from ? `&from=${searchParams.from}` : ""}${searchParams.to ? `&to=${searchParams.to}` : ""}`;

  return (
    <div>
      <PageHeader
        title="Rapports"
        description="Statistiques calculees directement depuis la base de donnees"
        action={
          <a href={exportUrl} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium px-4 py-2">
            <Download size={16} /> Exporter en CSV
          </a>
        }
      />

      <form className="flex flex-wrap gap-2 mb-6">
        {PERIODS.map((p) => (
          <a
            key={p.key}
            href={`?period=${p.key}`}
            className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${period === p.key ? "bg-odthan-black text-white border-odthan-black" : "bg-white border-gray-200"}`}
          >
            {p.label}
          </a>
        ))}
        <input type="date" name="from" defaultValue={searchParams.from} className="focus-ring rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
        <input type="date" name="to" defaultValue={searchParams.to} className="focus-ring rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
        <button name="period" value="custom" className="focus-ring rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white">Periode personnalisee</button>
      </form>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Revenus" value={formatMoney(revenue._sum.amount || 0)} icon="Coins" accent />
        <StatCard label="Paiements" value={paymentsCount} icon="Wallet" />
        <StatCard label="Commandes" value={ordersCount} icon="ClipboardList" />
        <StatCard label="Demandes" value={requestsCount} icon="Inbox" />
        <StatCard label="Nouveaux clients" value={newClients} icon="UserPlus" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Services les plus demandes (periode)</h2>
        {byService.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune donnee sur cette periode.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {byService.map((b) => (
              <li key={b.serviceId} className="flex items-center justify-between">
                <span>{serviceMap.get(b.serviceId) || "Service supprime"}</span>
                <span className="font-medium">{Number(b._count._all)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
