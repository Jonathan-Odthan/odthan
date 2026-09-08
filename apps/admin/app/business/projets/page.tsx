import { prisma } from "@odthan/database";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-[#A0A0A0]",
  SUBMITTED: "text-blue-400",
  IN_REVIEW: "text-yellow-400",
  IN_PROGRESS: "text-[#D4AF37]",
  COMPLETED: "text-green-400",
  CANCELLED: "text-red-400",
};

export default async function AdminBusinessProjectsPage() {
  const projects = await prisma.businessProject.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { include: { profile: true } } },
  });

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Projets Business</h1>

      <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-[#0D0D0D] text-left text-[#A0A0A0]">
            <tr>
              <th className="p-4">Projet</th>
              <th className="p-4">Client</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Progression</th>
              <th className="p-4">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-[#D4AF37]/10">
                <td className="p-4 text-white">{p.ideaTitle}</td>
                <td className="p-4 text-[#A0A0A0]">
                  {p.user.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : p.user.email}
                </td>
                <td className={`p-4 font-semibold ${STATUS_COLORS[p.status]}`}>{p.status}</td>
                <td className="p-4 text-[#A0A0A0]">{p.progress}%</td>
                <td className="p-4 text-[#A0A0A0]">{p.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
