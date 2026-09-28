import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const metadata = { title: "Paiements" };

export default async function PaymentsPage() {
  await requirePermission("payments.view");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { client: true, order: true },
  });

  return (
    <div>
      <PageHeader
        title="Paiements"
        description={`${payments.length} paiement(s)`}
        action={
          <Link href="/admin/paiements/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Enregistrer un paiement
          </Link>
        }
      />

      {payments.length === 0 ? (
        <EmptyState message="Aucun paiement enregistre." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Methode</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3 font-medium">{p.number}</td>
                  <td className="px-4 py-3">{p.client.firstName} {p.client.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.order?.number || "-"}</td>
                  <td className="px-4 py-3"><Badge>{p.method}</Badge></td>
                  <td className="px-4 py-3 font-medium">{formatMoney(p.amount, p.currency)}</td>
                  <td className="px-4 py-3"><Badge color={p.status === "CONFIRMED" ? "green" : p.status === "CANCELLED" ? "red" : "gray"}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
