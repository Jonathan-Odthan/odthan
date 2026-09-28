import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/page-header";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils/format";
import RevenueChart from "./revenue-chart";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalClients,
    newClientsThisMonth,
    pendingRequests,
    ordersInProgress,
    ordersCompleted,
    revenueToday,
    revenueMonth,
    paymentsPending,
    recentOrders,
    recentRequests,
    monthlyPayments,
    topServices,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.request.count({ where: { status: { in: ["NEW", "REVIEWING"] } } }),
    prisma.order.count({ where: { status: { in: ["IN_PROGRESS", "CONFIRMED"] } } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfDay }, status: "CONFIRMED" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth }, status: "CONFIRMED" } }),
    prisma.order.aggregate({ _sum: { amount: true, amountPaid: true }, where: { status: { notIn: ["CANCELLED", "COMPLETED"] } } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } }),
    prisma.request.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true, service: true } }),
    prisma.payment.findMany({ where: { createdAt: { gte: startOfYear }, status: "CONFIRMED" }, select: { amount: true, createdAt: true } }),
    prisma.service.findMany({
      take: 5,
      orderBy: { requests: { _count: "desc" } },
      select: { name: true, _count: { select: { requests: true } } },
    }),
  ]);

  const pendingBalance = Number(paymentsPending._sum.amount || 0) - Number(paymentsPending._sum.amountPaid || 0);

  const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({ month: i, total: 0 }));
  monthlyPayments.forEach((p) => {
    revenueByMonth[p.createdAt.getMonth()].total += Number(p.amount);
  });

  return (
    <div>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de l'activite Odthan Empire" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Clients totaux" value={totalClients} icon="Users" />
        <StatCard label="Nouveaux clients (mois)" value={newClientsThisMonth} icon="UserPlus" />
        <StatCard label="Demandes en attente" value={pendingRequests} icon="Inbox" accent />
        <StatCard label="Commandes en cours" value={ordersInProgress} icon="Loader" />
        <StatCard label="Commandes terminees" value={ordersCompleted} icon="CheckCircle2" />
        <StatCard label="Revenus du jour" value={formatMoney(revenueToday._sum.amount || 0)} icon="Coins" />
        <StatCard label="Revenus du mois" value={formatMoney(revenueMonth._sum.amount || 0)} icon="TrendingUp" accent />
        <StatCard label="Solde en attente" value={formatMoney(pendingBalance)} icon="AlertCircle" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3">Revenus (annee en cours)</h2>
          <RevenueChart data={revenueByMonth} />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3">Services les plus demandes</h2>
          {topServices.filter((s) => s._count.requests > 0).length === 0 ? (
            <EmptyState message="Aucune demande pour le moment." />
          ) : (
            <ul className="space-y-2">
              {topServices.map((s) => (
                <li key={s.name} className="flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <Badge>{s._count.requests}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Dernieres commandes</h2>
            <Link href="/admin/commandes" className="text-xs text-odthan-red hover:underline">Voir tout</Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState message="Aucune commande trouvee." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <li key={o.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{o.number}</p>
                    <p className="text-xs text-gray-500">{o.client.firstName} {o.client.lastName}</p>
                  </div>
                  <Badge color="blue">{o.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Dernieres demandes</h2>
            <Link href="/admin/demandes" className="text-xs text-odthan-red hover:underline">Voir tout</Link>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState message="Aucune demande trouvee." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentRequests.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{r.number}</p>
                    <p className="text-xs text-gray-500">{r.client.firstName} {r.client.lastName} - {r.service.name}</p>
                  </div>
                  <Badge color="amber">{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
