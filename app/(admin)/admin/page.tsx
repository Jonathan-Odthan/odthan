import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import TaskStatusSelect from "@/components/admin/task-status-select";

export const metadata = { title: "Taches" };

export default async function TasksPage() {
  await requirePermission("tasks.view");
  const canUpdate = await hasPermission("tasks.update");

  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: { assignee: true, client: true, order: true },
  });

  return (
    <div>
      <PageHeader
        title="Taches"
        description={`${tasks.length} tache(s)`}
        action={
          <Link href="/admin/taches/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouvelle tache
          </Link>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState message="Aucune tache trouvee." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Priorite</th>
                <th className="px-4 py-3">Echeance</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-gray-500">{t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : "Non assigne"}</td>
                  <td className="px-4 py-3"><Badge color={t.priority === "URGENT" ? "red" : t.priority === "HIGH" ? "amber" : "gray"}>{t.priority}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{t.dueDate ? formatDate(t.dueDate) : "-"}</td>
                  <td className="px-4 py-3">
                    {canUpdate ? (
                      <TaskStatusSelect taskId={t.id} status={t.status} />
                    ) : (
                      <Badge>{t.status}</Badge>
                    )}
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
