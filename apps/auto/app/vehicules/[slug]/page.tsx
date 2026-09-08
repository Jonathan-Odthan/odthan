import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@odthan/database";
import { Suspense } from "react";
import { VehicleLeadForm } from "./VehicleLeadForm";
import { FavoriteButton } from "./FavoriteButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: params.slug },
    include: { brand: true },
  });
  if (!vehicle) return {};

  return {
    title: `${vehicle.brand.name} ${vehicle.name} — ${vehicle.year}`,
    description: vehicle.description.slice(0, 160),
    openGraph: {
      title: `${vehicle.brand.name} ${vehicle.name}`,
      description: vehicle.description.slice(0, 160),
    },
  };
}

export default async function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: params.slug },
    include: { brand: true, images: { orderBy: { order: "asc" } } },
  });

  if (!vehicle || !vehicle.active) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="mb-4 aspect-video rounded-2xl bg-[#0D0D0D]" />
          <div className="grid grid-cols-4 gap-2">
            {vehicle.images.length === 0 && (
              <div className="col-span-4 aspect-video rounded-lg bg-[#0D0D0D]" />
            )}
          </div>
        </div>

        <div>
          <span className="text-sm uppercase tracking-widest text-[#D4AF37]">{vehicle.brand.name}</span>
          <h1 className="mb-4 mt-1 text-3xl font-bold text-white">{vehicle.name}</h1>
          <p className="mb-6 text-3xl font-bold text-[#D4AF37]">
            {Number(vehicle.price).toLocaleString()} {vehicle.currency}
          </p>

          <dl className="mb-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[#A0A0A0]">Année</dt>
              <dd className="text-white">{vehicle.year}</dd>
            </div>
            <div>
              <dt className="text-[#A0A0A0]">Kilométrage</dt>
              <dd className="text-white">{vehicle.mileage.toLocaleString()} km</dd>
            </div>
            <div>
              <dt className="text-[#A0A0A0]">Carburant</dt>
              <dd className="text-white">{vehicle.fuel}</dd>
            </div>
            <div>
              <dt className="text-[#A0A0A0]">Transmission</dt>
              <dd className="text-white">{vehicle.transmission}</dd>
            </div>
            <div>
              <dt className="text-[#A0A0A0]">Localisation</dt>
              <dd className="text-white">{vehicle.location}, {vehicle.country}</dd>
            </div>
          </dl>

          <p className="mb-8 leading-relaxed text-[#A0A0A0]">{vehicle.description}</p>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Bonjour, je suis intéressé(e) par ${vehicle.brand.name} ${vehicle.name} (${vehicle.year}) — ${Number(vehicle.price).toLocaleString()} ${vehicle.currency}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full border border-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#F1D77A] hover:bg-[#D4AF37]/10"
            >
              WhatsApp
            </a>
            <FavoriteButton
              vehicle={{
                id: vehicle.id,
                slug: vehicle.slug,
                name: vehicle.name,
                brandName: vehicle.brand.name,
                price: Number(vehicle.price),
                currency: vehicle.currency,
              }}
            />
          </div>

          <Suspense>
            <VehicleLeadForm vehicleId={vehicle.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
