import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Pagination from "@/components/ui/pagination";

export const metadata = { title: "Clients" };

const PAGE_SIZE = 20;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  await requirePermission("clients.view");

  const page = Math.max(1, Number(searchParams.page || 1));
  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const where = {
    ...(status ? { status: status as "ACTIVE" | "INACTIVE" } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { company: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.client.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${total} client${total > 1 ? "s" : ""} enregistre${total > 1 ? "s" : ""}`}
        action={
          <Link href="/admin/clients/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouveau client
          </Link>
        }
      />

      <form className="flex flex-wrap gap-3 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom, email, telephone..."
          className="focus-ring flex-1 min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
        />
        <select name="status" defaultValue={status || ""} className="focus-ring rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="INACTIVE">Inactif</option>
        </select>
        <button className="focus-ring rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-white">Filtrer</button>
      </form>

      {clients.length === 0 ? (
        <EmptyState message="Aucun client trouve." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Cree le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="font-medium hover:text-odthan-red focus-ring">
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.company || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || c.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge color={c.status === "ACTIVE" ? "green" : "gray"}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} />
    </div>
  );
}
