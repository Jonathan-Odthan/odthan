import { prisma } from "@odthan/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ" };

export default async function BusinessFaqPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { category: "business" },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-12 text-4xl font-bold text-white">Questions fréquentes</h1>
      {faqs.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucune question pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-6">
              <h2 className="mb-2 font-semibold text-white">{faq.question}</h2>
              <p className="text-sm text-[#A0A0A0]">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
