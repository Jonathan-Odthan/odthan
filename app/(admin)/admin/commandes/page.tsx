import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const metadata = { title: "Commandes" };

const STATUS_COLOR: Record<string, "gray" | "amber" | "green" | "blue" | "red"> = {
  PENDING: "gray",
  CONFIRMED: "blue",
  IN_PROGRESS: "amber",
  WAITING_PAYMENT: "red",
  WAITING_CLIENT: "gray",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  await requirePermission("orders.view");
  const status = searchParams.status;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { client: true },
  });

  return (
    <div>
      <PageHeader
        title="Commandes"
        description={`${orders.length} commande(s)`}
        action={
          <Link href="/admin/commandes/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouvelle commande
          </Link>
        }
      />

      <form className="flex flex-wrap gap-3 mb-4">
        <select name="status" defaultValue={status || ""} className="focus-ring rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">Tous les statuts</option>
          {Object.keys(STATUS_COLOR).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="focus-ring rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-white">Filtrer</button>
      </form>

      {orders.length === 0 ? (
        <EmptyState message="Aucune commande trouvee." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Paye</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${o.id}`} className="font-medium hover:text-odthan-red focus-ring">{o.number}</Link>
                  </td>
                  <td className="px-4 py-3">{o.client.firstName} {o.client.lastName}</td>
                  <td className="px-4 py-3">{formatMoney(o.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatMoney(o.amountPaid)}</td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLOR[o.status]}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
