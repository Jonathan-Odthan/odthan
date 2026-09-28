import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { deleteDocumentAction } from "@/actions/documents";
import ConfirmSubmitButton from "@/components/ui/confirm-submit-button";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  await requirePermission("documents.view");
  const canDelete = await hasPermission("documents.delete");

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { client: true, order: true, uploadedBy: true },
  });

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`${documents.length} document(s) — stockage prive, acces controle`}
        action={
          <Link href="/admin/documents/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Ajouter un document
          </Link>
        }
      />

      {documents.length === 0 ? (
        <EmptyState message="Aucun document." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Lie a</th>
                <th className="px-4 py-3">Ajoute par</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3"><Badge>{d.type}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{d.client ? `${d.client.firstName} ${d.client.lastName}` : d.order?.number || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{d.uploadedBy.firstName} {d.uploadedBy.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/api/documents/${d.id}/download`} className="focus-ring inline-flex items-center gap-1 text-xs rounded-lg border border-gray-200 px-3 py-1.5">
                        <Download size={12} /> Telecharger
                      </a>
                      {canDelete && (
                        <form action={deleteDocumentAction.bind(null, d.id)}>
                          <ConfirmSubmitButton confirmMessage="Supprimer ce document ?" className="text-xs rounded-lg border border-red-200 text-odthan-red px-3 py-1.5">
                            Supprimer
                          </ConfirmSubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
