import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils/format";
import StatusForm from "./status-form";

const STATUSES = ["NEW", "REVIEWING", "APPROVED", "IN_PROGRESS", "WAITING_CLIENT", "COMPLETED", "CANCELLED"];

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("requests.view");
  const canUpdate = await hasPermission("requests.update");

  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      service: true,
      assignee: true,
      history: { orderBy: { createdAt: "desc" } },
      documents: true,
    },
  });
  if (!request) notFound();

  return (
    <div>
      <PageHeader title={request.number} description={`${request.client.firstName} ${request.client.lastName} — ${request.service.name}`} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-2">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.description || "Aucune description."}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Historique</h2>
            {request.history.length === 0 ? <EmptyState message="Aucun historique." /> : (
              <ol className="relative border-l border-gray-200 pl-4 space-y-4">
                {request.history.map((h) => (
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
            <h2 className="text-sm font-semibold mb-2">Fichiers</h2>
            {request.documents.length === 0 ? <EmptyState message="Aucun fichier joint." /> : (
              <ul className="text-sm space-y-1">
                {request.documents.map((d) => <li key={d.id}>{d.name}</li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm text-sm space-y-2">
            <p><span className="text-gray-500">Statut :</span> <Badge>{request.status}</Badge></p>
            <p><span className="text-gray-500">Priorite :</span> <Badge>{request.priority}</Badge></p>
            <p><span className="text-gray-500">Responsable :</span> {request.assignee ? `${request.assignee.firstName} ${request.assignee.lastName}` : "Non assigne"}</p>
            <p><span className="text-gray-500">Cree le :</span> {formatDate(request.createdAt)}</p>
          </div>

          {canUpdate && (
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">Mettre a jour le statut</h2>
              <StatusForm requestId={request.id} statuses={STATUSES} currentStatus={request.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
