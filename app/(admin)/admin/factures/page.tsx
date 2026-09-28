import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const metadata = { title: "Factures" };

export default async function InvoicesPage() {
  await requirePermission("invoices.view");
  const invoices = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" }, take: 50, include: { client: true } });

  return (
    <div>
      <PageHeader
        title="Factures"
        description={`${invoices.length} facture(s)`}
        action={
          <Link href="/admin/factures/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouvelle facture
          </Link>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState message="Aucune facture generee." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/factures/${inv.id}`} className="font-medium hover:text-odthan-red focus-ring">{inv.number}</Link>
                  </td>
                  <td className="px-4 py-3">{inv.client.firstName} {inv.client.lastName}</td>
                  <td className="px-4 py-3 font-medium">{formatMoney(inv.total)}</td>
                  <td className="px-4 py-3"><Badge color={inv.status === "PAID" ? "green" : inv.status === "CANCELLED" ? "red" : "gray"}>{inv.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(inv.issuedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
