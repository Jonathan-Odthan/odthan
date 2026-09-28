import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { deactivateClientAction } from "@/actions/clients";
import ConfirmSubmitButton from "@/components/ui/confirm-submit-button";
import { Pencil } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("clients.view");
  const canEdit = await hasPermission("clients.update");
  const canDelete = await hasPermission("clients.delete");

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      requests: { orderBy: { createdAt: "desc" }, take: 10, include: { service: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!client) notFound();

  return (
    <div>
      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        description={client.company || undefined}
        action={
          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/admin/clients/${client.id}/edit`} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium px-4 py-2">
                <Pencil size={14} /> Modifier
              </Link>
            )}
            {canDelete && client.status === "ACTIVE" && (
              <form action={deactivateClientAction.bind(null, client.id)}>
                <ConfirmSubmitButton confirmMessage="Desactiver ce client ?" className="rounded-lg border border-red-200 text-odthan-red px-4 py-2 bg-white">
                  Desactiver
                </ConfirmSubmitButton>
              </form>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm lg:col-span-1 space-y-2 text-sm">
          <p><span className="text-gray-500">Statut :</span> <Badge color={client.status === "ACTIVE" ? "green" : "gray"}>{client.status}</Badge></p>
          <p><span className="text-gray-500">Email :</span> {client.email || "-"}</p>
          <p><span className="text-gray-500">Telephone :</span> {client.phone || "-"}</p>
          <p><span className="text-gray-500">WhatsApp :</span> {client.whatsapp || "-"}</p>
          <p><span className="text-gray-500">Adresse :</span> {client.address || "-"}</p>
          <p><span className="text-gray-500">Ville / Pays :</span> {[client.city, client.country].filter(Boolean).join(", ") || "-"}</p>
          <p><span className="text-gray-500">Client depuis :</span> {formatDate(client.createdAt)}</p>
          {client.notes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 mb-1">Notes internes</p>
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Commandes recentes</h2>
            {client.orders.length === 0 ? <EmptyState message="Aucune commande." /> : (
              <ul className="divide-y divide-gray-100 text-sm">
                {client.orders.map((o) => (
                  <li key={o.id} className="py-2 flex items-center justify-between">
                    <Link href={`/admin/commandes/${o.id}`} className="hover:text-odthan-red focus-ring">{o.number}</Link>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{formatMoney(o.amount)}</span>
                      <Badge color="blue">{o.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Demandes recentes</h2>
            {client.requests.length === 0 ? <EmptyState message="Aucune demande." /> : (
              <ul className="divide-y divide-gray-100 text-sm">
                {client.requests.map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between">
                    <Link href={`/admin/demandes/${r.id}`} className="hover:text-odthan-red focus-ring">{r.number} - {r.service.name}</Link>
                    <Badge color="amber">{r.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Paiements</h2>
            {client.payments.length === 0 ? <EmptyState message="Aucun paiement." /> : (
              <ul className="divide-y divide-gray-100 text-sm">
                {client.payments.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <span>{p.number} - {p.method}</span>
                    <span className="font-medium">{formatMoney(p.amount, p.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Documents</h2>
            {client.documents.length === 0 ? <EmptyState message="Aucun document." /> : (
              <ul className="divide-y divide-gray-100 text-sm">
                {client.documents.map((doc) => (
                  <li key={doc.id} className="py-2 flex items-center justify-between">
                    <span>{doc.name}</span>
                    <span className="text-gray-500">{doc.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
