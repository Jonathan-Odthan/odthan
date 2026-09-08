import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partenaires" };

export default async function PartnersPage() {
  const partners = await prisma.vehiclePartner.findMany({
    distinct: ["name"],
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-12 text-4xl font-bold text-white">Nos partenaires</h1>
      {partners.length === 0 ? (
        <p className="text-[#A0A0A0]">Réseau de partenaires en cours de constitution.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {partners.map((p) => (
            <Card key={p.id} className="text-center">
              <p className="font-semibold text-[#F1D77A]">{p.name}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
