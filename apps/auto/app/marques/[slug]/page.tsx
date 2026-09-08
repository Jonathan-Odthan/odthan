import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = await prisma.vehicleBrand.findUnique({ where: { slug: params.slug } });
  if (!brand) return {};
  return { title: `Véhicules ${brand.name}` };
}

export default async function BrandDetailPage({ params }: { params: { slug: string } }) {
  const brand = await prisma.vehicleBrand.findUnique({ where: { slug: params.slug } });
  if (!brand) notFound();

  const vehicles = await prisma.vehicle.findMany({
    where: { brandId: brand.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-10 text-3xl font-bold text-white">Véhicules {brand.name}</h1>

      {vehicles.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucun véhicule disponible pour cette marque actuellement.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {vehicles.map((v) => (
            <Link key={v.id} href={`/vehicules/${v.slug}`}>
              <Card className="h-full">
                <div className="mb-4 aspect-video rounded-lg bg-[#050505]" />
                <h3 className="font-bold text-white">{v.name}</h3>
                <p className="text-sm text-[#A0A0A0]">{v.year} • {v.mileage.toLocaleString()} km</p>
                <p className="mt-2 text-lg font-bold text-[#D4AF37]">
                  {Number(v.price).toLocaleString()} {v.currency}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
