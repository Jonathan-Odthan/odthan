import { prisma, RoleName } from "@odthan/database";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const roleName = searchParams.role;
  const validRole = roleName && Object.values(RoleName).includes(roleName as RoleName) ? (roleName as RoleName) : null;

  const users = await prisma.user.findMany({
    where: validRole ? { roles: { some: { role: { name: validRole } } } } : {},
    orderBy: { createdAt: "desc" },
    include: { profile: true, roles: { include: { role: true } } },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-white">Utilisateurs</h1>
      <p className="mb-8 text-sm text-[#A0A0A0]">
        {searchParams.role ? `Filtre : ${searchParams.role}` : "Tous les utilisateurs"} — {users.length} résultat(s)
      </p>

      <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-[#0D0D0D] text-left text-[#A0A0A0]">
            <tr>
              <th className="p-4">Nom</th>
              <th className="p-4">Email</th>
              <th className="p-4">Rôles</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[#D4AF37]/10">
                <td className="p-4 text-white">
                  {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : "—"}
                </td>
                <td className="p-4 text-[#A0A0A0]">{u.email}</td>
                <td className="p-4 text-[#A0A0A0]">
                  {u.roles.map((r) => r.role.name).join(", ")}
                </td>
                <td className="p-4">
                  <span className={u.isActive ? "text-green-400" : "text-red-400"}>
                    {u.isActive ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td className="p-4 text-[#A0A0A0]">{u.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
