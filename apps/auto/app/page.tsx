import Link from "next/link";
import { prisma } from "@odthan/database";
import { Button, Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

export default async function AutoHomePage() {
  const [featured, brands] = await Promise.all([
    prisma.vehicle.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { brand: true, images: { take: 1, orderBy: { order: "asc" } } },
    }),
    prisma.vehicleBrand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="px-6 py-24 text-center">
        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">
          ODTHAN AUTO
        </span>
        <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
          Trouvez votre prochain véhicule
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-[#A0A0A0]">
          Une marketplace automobile affiliée, avec un réseau de partenaires de confiance.
        </p>
        <Link href="/vehicules">
          <Button variant="primary">Voir les véhicules</Button>
        </Link>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Marques</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/marques/${b.slug}`}
                className="rounded-full border border-[#D4AF37]/30 px-6 py-2 text-sm text-[#A0A0A0] hover:border-[#D4AF37] hover:text-[#F1D77A]"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Véhicules récents</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {featured.map((v) => (
              <Link key={v.id} href={`/vehicules/${v.slug}`}>
                <Card className="h-full">
                  <div className="mb-4 aspect-video rounded-lg bg-[#050505]" />
                  <h3 className="font-bold text-white">
                    {v.brand.name} {v.name}
                  </h3>
                  <p className="text-sm text-[#A0A0A0]">{v.year} • {v.mileage.toLocaleString()} km</p>
                  <p className="mt-2 text-lg font-bold text-[#D4AF37]">
                    {Number(v.price).toLocaleString()} {v.currency}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
