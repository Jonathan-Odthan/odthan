import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Demandes" };

const STATUS_COLOR: Record<string, "gray" | "amber" | "green" | "blue" | "red"> = {
  NEW: "blue",
  REVIEWING: "amber",
  APPROVED: "green",
  IN_PROGRESS: "amber",
  WAITING_CLIENT: "gray",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function RequestsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requirePermission("requests.view");
  const status = searchParams.status;

  const requests = await prisma.request.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { client: true, service: true, assignee: true },
  });

  return (
    <div>
      <PageHeader
        title="Demandes"
        description={`${requests.length} demande(s)`}
        action={
          <Link href="/admin/demandes/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouvelle demande
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

      {requests.length === 0 ? (
        <EmptyState message="Aucune demande trouvee." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Priorite</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/demandes/${r.id}`} className="font-medium hover:text-odthan-red focus-ring">{r.number}</Link>
                  </td>
                  <td className="px-4 py-3">{r.client.firstName} {r.client.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.service.name}</td>
                  <td className="px-4 py-3"><Badge>{r.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
