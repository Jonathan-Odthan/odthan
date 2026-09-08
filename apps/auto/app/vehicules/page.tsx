import Link from "next/link";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

interface SearchParams {
  brandSlug?: string;
  fuel?: string;
  transmission?: string;
  bodyType?: string;
  priceMin?: string;
  priceMax?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

export const metadata = { title: "Véhicules" };

export default async function VehiclesPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? "1");

  const where = {
    active: true,
    ...(searchParams.brandSlug ? { brand: { slug: searchParams.brandSlug } } : {}),
    ...(searchParams.fuel ? { fuel: searchParams.fuel } : {}),
    ...(searchParams.transmission ? { transmission: searchParams.transmission } : {}),
    ...(searchParams.bodyType ? { bodyType: searchParams.bodyType } : {}),
    ...(searchParams.priceMin || searchParams.priceMax
      ? {
          price: {
            gte: searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
            lte: searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
          },
        }
      : {}),
  };

  const orderBy =
    searchParams.sort === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const [vehicles, total, brands] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { brand: true },
    }),
    prisma.vehicle.count({ where }),
    prisma.vehicleBrand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildUrl(overrides: Partial<SearchParams>) {
    const merged = { ...searchParams, ...overrides };
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v) as [string, string][]
    ).toString();
    return `/vehicules${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-white">Véhicules</h1>

      {/* Filtres */}
      <form className="mb-10 grid gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#0D0D0D] p-6 sm:grid-cols-2 md:grid-cols-4">
        <select
          name="brandSlug"
          defaultValue={searchParams.brandSlug ?? ""}
          className="rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-3 py-2 text-sm text-white"
        >
          <option value="">Toutes les marques</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>

        <select
          name="fuel"
          defaultValue={searchParams.fuel ?? ""}
          className="rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-3 py-2 text-sm text-white"
        >
          <option value="">Carburant</option>
          <option value="Essence">Essence</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybride">Hybride</option>
          <option value="Électrique">Électrique</option>
        </select>

        <input
          name="priceMin"
          placeholder="Prix min"
          defaultValue={searchParams.priceMin ?? ""}
          className="rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-3 py-2 text-sm text-white"
        />
        <input
          name="priceMax"
          placeholder="Prix max"
          defaultValue={searchParams.priceMax ?? ""}
          className="rounded-lg border border-[#D4AF37]/30 bg-[#050505] px-3 py-2 text-sm text-white"
        />

        <button
          type="submit"
          className="col-span-full rounded-full bg-[#D4AF37] px-6 py-2 text-sm font-semibold text-[#050505] hover:bg-[#F1D77A]"
        >
          Filtrer
        </button>
      </form>

      <div className="mb-4 flex justify-end gap-2 text-sm text-[#A0A0A0]">
        <Link href={buildUrl({ sort: "recent" })} className="hover:text-[#F1D77A]">Récent</Link>
        <span>·</span>
        <Link href={buildUrl({ sort: "price_asc" })} className="hover:text-[#F1D77A]">Prix ↑</Link>
        <span>·</span>
        <Link href={buildUrl({ sort: "price_desc" })} className="hover:text-[#F1D77A]">Prix ↓</Link>
      </div>

      {vehicles.length === 0 ? (
        <p className="py-20 text-center text-[#A0A0A0]">Aucun véhicule ne correspond à ces critères.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {vehicles.map((v) => (
            <Link key={v.id} href={`/vehicules/${v.slug}`}>
              <Card className="h-full">
                <div className="mb-4 aspect-video rounded-lg bg-[#050505]" />
                <h3 className="font-bold text-white">{v.brand.name} {v.name}</h3>
                <p className="text-sm text-[#A0A0A0]">
                  {v.year} • {v.mileage.toLocaleString()} km • {v.fuel}
                </p>
                <p className="mt-2 text-lg font-bold text-[#D4AF37]">
                  {Number(v.price).toLocaleString()} {v.currency}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              className={`rounded-full px-4 py-2 text-sm ${
                p === page ? "bg-[#D4AF37] text-[#050505]" : "border border-[#D4AF37]/30 text-[#A0A0A0]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
