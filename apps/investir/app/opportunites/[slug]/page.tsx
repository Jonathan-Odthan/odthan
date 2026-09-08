import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@odthan/database";
import { InvestmentRequestForm } from "./InvestmentRequestForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const opp = await prisma.investmentOpportunity.findUnique({ where: { slug: params.slug } });
  if (!opp) return {};
  return { title: opp.title, description: opp.description.slice(0, 160) };
}

export default async function OpportunityDetailPage({ params }: { params: { slug: string } }) {
  const opportunity = await prisma.investmentOpportunity.findUnique({ where: { slug: params.slug } });

  if (!opportunity || !opportunity.active) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-4 text-3xl font-bold text-white">{opportunity.title}</h1>
      <p className="mb-8 leading-relaxed text-[#A0A0A0]">{opportunity.description}</p>

      <dl className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-6 text-sm">
        <div>
          <dt className="text-[#A0A0A0]">Montant minimum</dt>
          <dd className="text-white">{Number(opportunity.minimum).toLocaleString()} {opportunity.currency}</dd>
        </div>
        <div>
          <dt className="text-[#A0A0A0]">Durée</dt>
          <dd className="text-white">{opportunity.termMonths} mois</dd>
        </div>
        <div>
          <dt className="text-[#A0A0A0]">Objectif</dt>
          <dd className="text-white">{Number(opportunity.target).toLocaleString()} {opportunity.currency}</dd>
        </div>
      </dl>

      <p className="mb-8 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 text-xs text-[#A0A0A0]">
        Aucun rendement n&apos;est garanti. Cette opportunité ne constitue pas une offre financière
        réglementée. Toute demande fait l&apos;objet d&apos;une validation manuelle avant activation.
      </p>

      <InvestmentRequestForm opportunityId={opportunity.id} currency={opportunity.currency} minimum={Number(opportunity.minimum)} />
    </div>
  );
}
