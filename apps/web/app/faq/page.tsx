import { prisma } from "@odthan/database";
import { FaqAccordion } from "./FaqAccordion";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-12 text-4xl font-bold text-white">Questions fréquentes</h1>
      {faqs.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucune question pour le moment.</p>
      ) : (
        <FaqAccordion faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
      )}
    </div>
  );
}
