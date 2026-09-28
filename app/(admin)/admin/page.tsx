import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import Badge from "@/components/ui/badge";
import { updateRolePermissionsAction } from "@/actions/roles";

export const metadata = { title: "Roles & Permissions" };

export default async function RolesPage() {
  await requirePermission("roles.view");
  const canUpdate = await hasPermission("roles.update");

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" }, include: { permissions: { include: { permission: true } } } }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { key: "asc" }] }),
  ]);

  const permissionsByModule = permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    (acc[p.module] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Roles & Permissions" description="SUPER_ADMIN dispose toujours d'un acces complet, non modifiable ici." />

      <div className="space-y-6">
        {roles.map((role) => {
          const activeKeys = new Set(role.permissions.map((rp) => rp.permission.key));
          const isSuperAdmin = role.name === "SUPER_ADMIN";

          return (
            <div key={role.id} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">{role.label}</h2>
                {isSuperAdmin && <Badge color="red">Acces complet (implicite)</Badge>}
              </div>

              {isSuperAdmin ? (
                <p className="text-sm text-gray-500">Ce role a acces a tous les modules et actions par definition.</p>
              ) : (
                <form action={updateRolePermissionsAction.bind(null, role.id)} className="space-y-4">
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module}>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{module}</p>
                      <div className="flex flex-wrap gap-3">
                        {perms.map((p) => (
                          <label key={p.id} className="flex items-center gap-1.5 text-sm">
                            <input
                              type="checkbox"
                              name="permissions"
                              value={p.key}
                              defaultChecked={activeKeys.has(p.key)}
                              disabled={!canUpdate}
                              className="rounded"
                            />
                            {p.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {canUpdate && (
                    <button className="focus-ring rounded-lg bg-odthan-black text-white text-sm font-medium px-4 py-2">
                      Enregistrer les permissions
                    </button>
                  )}
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
