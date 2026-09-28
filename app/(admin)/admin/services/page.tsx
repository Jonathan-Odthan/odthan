import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { formatMoney } from "@/lib/utils/format";
import { toggleServiceStatusAction } from "@/actions/services";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  await requirePermission("services.view");
  const canUpdate = await hasPermission("services.update");
  const canCreate = await hasPermission("services.create");

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { requests: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Services"
        description={`${services.length} service(s) Odthan Empire`}
        action={
          canCreate && (
            <Link href="/admin/services/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
              <Plus size={16} /> Nouveau service
            </Link>
          )
        }
      />

      {services.length === 0 ? (
        <EmptyState message="Aucun service configure." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                <Badge color={s.status === "ACTIVE" ? "green" : "gray"}>{s.status}</Badge>
              </div>
              {s.category && <p className="text-xs text-gray-500">{s.category.name}</p>}
              <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
              <p className="text-lg font-bold">{formatMoney(s.price)}</p>
              <p className="text-xs text-gray-400">{s._count.requests} demande(s)</p>
              <div className="flex items-center gap-2 mt-2">
                {canUpdate && (
                  <>
                    <Link href={`/admin/services/${s.id}/edit`} className="focus-ring inline-flex items-center gap-1 text-xs rounded-lg border border-gray-200 px-3 py-1.5">
                      <Pencil size={12} /> Modifier
                    </Link>
                    <form action={toggleServiceStatusAction.bind(null, s.id, s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}>
                      <button className="focus-ring text-xs rounded-lg border border-gray-200 px-3 py-1.5">
                        {s.status === "ACTIVE" ? "Desactiver" : "Activer"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
