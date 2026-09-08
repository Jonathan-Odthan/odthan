import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partenaires" };

export default async function PartnersPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold text-white">Nos partenaires</h1>
      <p className="mb-12 text-[#A0A0A0]">
        ODTHAN collabore avec un réseau de partenaires de confiance à travers ses trois activités.
      </p>

      {testimonials.length > 0 && (
        <>
          <h2 className="mb-6 text-2xl font-bold text-white">Témoignages</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id}>
                <p className="mb-4 text-sm italic text-[#A0A0A0]">&laquo; {t.content} &raquo;</p>
                <p className="text-sm font-semibold text-[#F1D77A]">{t.authorName}</p>
                {t.role && <p className="text-xs text-[#A0A0A0]">{t.role}</p>}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
