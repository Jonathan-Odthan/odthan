import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@odthan/auth";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export default async function AccountHomePage() {
  const token = cookies().get("odthan_session")?.value;
  const user = await getSessionUser(token);

  if (!user) {
    redirect("https://www.odthan.com/connexion");
  }

  const [unreadCount, businessProject, investmentsCount, documentsCount, paymentsCount] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    prisma.businessProject.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.investment.count({ where: { userId: user.id } }),
    prisma.document.count({ where: { userId: user.id } }),
    prisma.payment.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">
        Bonjour {user.profile?.firstName ?? user.email}
      </h1>
      <p className="mb-10 text-[#A0A0A0]">Votre compte central ODTHAN.</p>

      <h2 className="mb-4 text-lg font-semibold text-[#F1D77A]">Mes activités</h2>
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        <Card>
          <h3 className="mb-2 font-bold text-white">Business</h3>
          <p className="mb-4 text-sm text-[#A0A0A0]">
            {businessProject ? `Statut : ${businessProject.status}` : "Aucun projet en cours."}
          </p>
          <a href="https://business.odthan.com/account/business" className="text-sm text-[#D4AF37] hover:underline">
            Voir mon espace Business →
          </a>
        </Card>
        <Card>
          <h3 className="mb-2 font-bold text-white">Auto</h3>
          <p className="mb-4 text-sm text-[#A0A0A0]">Suivez vos demandes de véhicules.</p>
          <a href="https://auto.odthan.com/favoris" className="text-sm text-[#D4AF37] hover:underline">
            Voir mes favoris Auto →
          </a>
        </Card>
        <Card>
          <h3 className="mb-2 font-bold text-white">Investir</h3>
          <p className="mb-4 text-sm text-[#A0A0A0]">
            {investmentsCount} investissement(s) enregistré(s).
          </p>
          <a href="https://investir.odthan.com/account/investir" className="text-sm text-[#D4AF37] hover:underline">
            Voir mon portefeuille →
          </a>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Link href="/notifications">
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">{unreadCount}</div>
            <div className="text-sm text-[#A0A0A0]">Notifications</div>
          </Card>
        </Link>
        <Link href="/documents">
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">{documentsCount}</div>
            <div className="text-sm text-[#A0A0A0]">Documents</div>
          </Card>
        </Link>
        <Link href="/paiements">
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">{paymentsCount}</div>
            <div className="text-sm text-[#A0A0A0]">Paiements</div>
          </Card>
        </Link>
        <Link href="/profil">
          <Card className="text-center">
            <div className="text-sm text-[#A0A0A0]">Profil & Sécurité</div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
