import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import { formatDate, formatMoney } from "@/lib/utils/format";
import PrintButton from "./print-button";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("invoices.view");
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id }, include: { client: true, order: true } });
  if (!invoice) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <PrintButton />
      </div>
      <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <img src="/branding/logo.png" alt="Odthan" className="h-8 mb-2" />
            <p className="text-sm text-gray-500">Odthan Empire</p>
            <p className="text-xs text-gray-400">odthanempire@gmail.com — www.odthan.com</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold">FACTURE</h1>
            <p className="text-sm text-gray-500">{invoice.number}</p>
            <p className="text-xs text-gray-400">{formatDate(invoice.issuedAt)}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase mb-1">Facture a</p>
          <p className="font-medium">{invoice.client.firstName} {invoice.client.lastName}</p>
          {invoice.client.company && <p className="text-sm text-gray-500">{invoice.client.company}</p>}
          {invoice.client.email && <p className="text-sm text-gray-500">{invoice.client.email}</p>}
        </div>

        {invoice.order && <p className="text-sm text-gray-500 mb-4">Commande liee : {invoice.order.number}</p>}

        <table className="w-full text-sm mb-6">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-500">Sous-total</td>
              <td className="py-2 text-right">{formatMoney(invoice.subtotal)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-500">Reduction</td>
              <td className="py-2 text-right">-{formatMoney(invoice.discount)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-semibold">Total</td>
              <td className="py-2 text-right font-semibold">{formatMoney(invoice.total)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Montant paye</td>
              <td className="py-2 text-right">{formatMoney(invoice.amountPaid)}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs text-gray-400">Statut : {invoice.status}{invoice.dueDate ? ` — Echeance : ${formatDate(invoice.dueDate)}` : ""}</p>
      </div>
      <p className="text-xs text-gray-400 mt-3 print:hidden">
        Astuce : utilisez &quot;Imprimer&quot; puis &quot;Enregistrer au format PDF&quot; dans votre navigateur pour exporter cette facture.
        Une generation PDF cote serveur peut etre ajoutee plus tard (ex. avec `@react-pdf/renderer`).
      </p>
    </div>
  );
}
