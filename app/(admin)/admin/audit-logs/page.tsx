import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import Pagination from "@/components/ui/pagination";

export const metadata = { title: "Audit Logs" };

const PAGE_SIZE = 30;

export default async function AuditLogsPage({ searchParams }: { searchParams: { page?: string; module?: string } }) {
  await requirePermission("audit.view");
  const page = Math.max(1, Number(searchParams.page || 1));
  const moduleFilter = searchParams.module;

  const where = moduleFilter ? { module: moduleFilter } : undefined;

  const [logs, total, modules] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { profile: true },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ distinct: ["module"], select: { module: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Audit Logs" description="Journal en lecture seule — non modifiable par les utilisateurs standards" />

      <form className="flex flex-wrap gap-3 mb-4">
        <select name="module" defaultValue={moduleFilter || ""} className="focus-ring rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
          <option value="">Tous les modules</option>
          {modules.map((m) => <option key={m.module} value={m.module}>{m.module}</option>)}
        </select>
        <button className="focus-ring rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium bg-white">Filtrer</button>
      </form>

      {logs.length === 0 ? (
        <EmptyState message="Aucune entree d'audit." />
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Resultat</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-odthan-gray/50">
                  <td className="px-4 py-3">{log.profile ? `${log.profile.firstName} ${log.profile.lastName}` : "Systeme"}</td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-gray-500">{log.module}</td>
                  <td className="px-4 py-3"><Badge color={log.result === "SUCCESS" ? "green" : "red"}>{log.result}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{log.ip || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
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
