import Link from "next/link";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marques" };

export default async function BrandsPage() {
  const brands = await prisma.vehicleBrand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { vehicles: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-12 text-4xl font-bold text-white">Marques</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {brands.map((b) => (
          <Link key={b.id} href={`/marques/${b.slug}`}>
            <Card className="text-center">
              <h2 className="font-bold text-[#F1D77A]">{b.name}</h2>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
