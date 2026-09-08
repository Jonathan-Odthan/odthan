import Link from "next/link";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Opportunités" };

export default async function OpportunitiesPage() {
  const opportunities = await prisma.investmentOpportunity.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold text-white">Opportunités d&apos;investissement</h1>
      <p className="mb-12 text-sm text-[#A0A0A0]">
        Aucun rendement n&apos;est garanti. Chaque opportunité a été validée avant sa mise en ligne.
      </p>

      {opportunities.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucune opportunité active pour le moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {opportunities.map((o) => (
            <Link key={o.id} href={`/opportunites/${o.slug}`}>
              <Card className="h-full">
                <h2 className="mb-2 font-bold text-[#F1D77A]">{o.title}</h2>
                <p className="mb-4 text-sm text-[#A0A0A0] line-clamp-3">{o.description}</p>
                <p className="text-sm text-[#A0A0A0]">
                  Minimum : <span className="text-white">{Number(o.minimum).toLocaleString()} {o.currency}</span>
                </p>
                <p className="text-sm text-[#A0A0A0]">
                  Durée : <span className="text-white">{o.termMonths} mois</span>
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
