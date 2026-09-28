import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { deactivateUserAction } from "@/actions/users";
import ConfirmSubmitButton from "@/components/ui/confirm-submit-button";

export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  await requirePermission("users.view");
  const canUpdate = await hasPermission("users.update");
  const canDelete = await hasPermission("users.delete");

  const users = await prisma.profile.findMany({ orderBy: { createdAt: "desc" }, include: { role: true } });

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description={`${users.length} membre(s) de l'equipe`}
        action={
          <Link href="/admin/utilisateurs/new" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
            <Plus size={16} /> Nouvel utilisateur
          </Link>
        }
      />

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-odthan-gray text-left text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Derniere connexion</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-odthan-gray/50">
                <td className="px-4 py-3 font-medium">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><Badge>{u.role.label}</Badge></td>
                <td className="px-4 py-3"><Badge color={u.status === "ACTIVE" ? "green" : u.status === "SUSPENDED" ? "red" : "gray"}>{u.status}</Badge></td>
                <td className="px-4 py-3 text-gray-500">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Jamais"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canUpdate && (
                      <Link href={`/admin/utilisateurs/${u.id}/edit`} className="focus-ring inline-flex items-center gap-1 text-xs rounded-lg border border-gray-200 px-3 py-1.5">
                        <Pencil size={12} /> Modifier
                      </Link>
                    )}
                    {canDelete && u.status === "ACTIVE" && (
                      <form action={deactivateUserAction.bind(null, u.id)}>
                        <ConfirmSubmitButton confirmMessage="Desactiver cet utilisateur ?" className="text-xs rounded-lg border border-red-200 text-odthan-red px-3 py-1.5">
                          Desactiver
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
    </div>
  );
}
