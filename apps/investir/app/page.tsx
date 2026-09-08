import Link from "next/link";
import { prisma } from "@odthan/database";
import { Button, Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

export default async function InvestirHomePage() {
  const opportunities = await prisma.investmentOpportunity.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      <section className="px-6 py-24 text-center">
        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">
          ODTHAN INVESTIR
        </span>
        <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
          Explorez des opportunités d&apos;investissement
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-[#A0A0A0]">
          Une infrastructure technique pour découvrir des projets et suivre vos investissements en toute transparence.
        </p>
        <p className="mx-auto mb-10 max-w-xl text-xs text-[#A0A0A0]">
          Aucun rendement n&apos;est garanti. ODTHAN n&apos;est pas un établissement financier réglementé.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/opportunites"><Button variant="primary">Voir les opportunités</Button></Link>
          <Link href="/calculateur"><Button variant="secondary">Calculateur</Button></Link>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Opportunités actives</h2>

          {opportunities.length === 0 ? (
            <p className="text-center text-[#A0A0A0]">
              Aucune opportunité active pour le moment. Revenez bientôt.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {opportunities.map((o) => (
                <Link key={o.id} href={`/opportunites/${o.slug}`}>
                  <Card className="h-full">
                    <h3 className="mb-2 font-bold text-[#F1D77A]">{o.title}</h3>
                    <p className="mb-4 text-sm text-[#A0A0A0] line-clamp-3">{o.description}</p>
                    <dl className="text-sm text-[#A0A0A0]">
                      <div>Minimum : <span className="text-white">{Number(o.minimum).toLocaleString()} {o.currency}</span></div>
                      <div>Durée : <span className="text-white">{o.termMonths} mois</span></div>
                    </dl>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
