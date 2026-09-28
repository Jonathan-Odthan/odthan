import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { formatDate, formatMoney } from "@/lib/utils/format";
import StatusForm from "./status-form";

const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "WAITING_PAYMENT", "WAITING_CLIENT", "COMPLETED", "CANCELLED"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("orders.view");
  const canUpdate = await hasPermission("orders.update");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      assignee: true,
      payments: { orderBy: { createdAt: "desc" } },
      documents: true,
      tasks: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const balance = Number(order.amount) - Number(order.amountPaid);

  return (
    <div>
      <PageHeader title={order.number} description={`${order.client.firstName} ${order.client.lastName}`} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Timeline</h2>
            {order.history.length === 0 ? <EmptyState message="Aucun historique." /> : (
              <ol className="relative border-l border-gray-200 pl-4 space-y-4">
                {order.history.map((h) => (
                  <li key={h.id}>
                    <div className="flex items-center gap-2">
                      <Badge>{h.status}</Badge>
                      <span className="text-xs text-gray-400">{formatDate(h.createdAt)}</span>
                    </div>
                    {h.note && <p className="text-sm text-gray-600 mt-1">{h.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Paiements</h2>
            {order.payments.length === 0 ? <EmptyState message="Aucun paiement enregistre." /> : (
              <ul className="divide-y divide-gray-100 text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <span>{p.number} — {p.method}</span>
                    <span className="font-medium">{formatMoney(p.amount, p.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Taches liees</h2>
            {order.tasks.length === 0 ? <EmptyState message="Aucune tache liee." /> : (
              <ul className="divide-y divide-gray-100 text-sm">
                {order.tasks.map((t) => (
                  <li key={t.id} className="py-2 flex items-center justify-between">
                    <span>{t.title}</span>
                    <Badge>{t.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm text-sm space-y-2">
            <p><span className="text-gray-500">Statut :</span> <Badge>{order.status}</Badge></p>
            <p><span className="text-gray-500">Montant :</span> {formatMoney(order.amount)}</p>
            <p><span className="text-gray-500">Paye :</span> {formatMoney(order.amountPaid)}</p>
            <p><span className="text-gray-500">Solde :</span> <span className={balance > 0 ? "text-odthan-red font-medium" : ""}>{formatMoney(balance)}</span></p>
            <p><span className="text-gray-500">Responsable :</span> {order.assignee ? `${order.assignee.firstName} ${order.assignee.lastName}` : "Non assigne"}</p>
            {order.dueDate && <p><span className="text-gray-500">Date limite :</span> {formatDate(order.dueDate)}</p>}
            <p><span className="text-gray-500">Cree le :</span> {formatDate(order.createdAt)}</p>
          </div>

          {canUpdate && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Mettre a jour le statut</h2>
              <StatusForm orderId={order.id} statuses={STATUSES} currentStatus={order.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
