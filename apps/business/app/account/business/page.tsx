import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@odthan/auth";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  IN_REVIEW: "En examen",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export default async function BusinessDashboardPage() {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);
  if (!user) redirect("https://www.odthan.com/connexion");

  const projects = await prisma.businessProject.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      services: { include: { service: true } },
      documents: true,
      payments: true,
      messages: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold text-white">Mon espace Business</h1>

      {projects.length === 0 && (
        <Card>
          <p className="text-[#A0A0A0]">
            Vous n&apos;avez encore aucun projet. Commencez par créer votre entreprise.
          </p>
        </Card>
      )}

      {projects.map((project) => (
        <Card key={project.id} className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F1D77A]">{project.ideaTitle}</h2>
            <span className="rounded-full border border-[#D4AF37]/40 px-3 py-1 text-xs text-[#D4AF37]">
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>

          <div className="mb-4 h-2 w-full rounded-full bg-[#050505]">
            <div
              className="h-2 rounded-full bg-[#D4AF37] transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mb-6 text-sm text-[#A0A0A0]">{project.progress}% complété</p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-white">Services</h3>
              <ul className="space-y-1 text-sm text-[#A0A0A0]">
                {project.services.map((s) => (
                  <li key={s.serviceId}>• {s.service.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-white">Documents & Paiements</h3>
              <p className="text-sm text-[#A0A0A0]">{project.documents.length} document(s)</p>
              <p className="text-sm text-[#A0A0A0]">{project.payments.length} paiement(s)</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
