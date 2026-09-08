import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { vehicleSearchSchema } from "@odthan/validation";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = vehicleSearchSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Filtres invalides.", details: parsed.error.flatten() }, { status: 400 });
  }

  const f = parsed.data;

  const where = {
    active: true,
    ...(f.brandSlug ? { brand: { slug: f.brandSlug } } : {}),
    ...(f.model ? { name: { contains: f.model, mode: "insensitive" as const } } : {}),
    ...(f.yearMin || f.yearMax
      ? { year: { gte: f.yearMin ?? undefined, lte: f.yearMax ?? undefined } }
      : {}),
    ...(f.priceMin || f.priceMax
      ? { price: { gte: f.priceMin ?? undefined, lte: f.priceMax ?? undefined } }
      : {}),
    ...(f.mileageMax ? { mileage: { lte: f.mileageMax } } : {}),
    ...(f.fuel ? { fuel: f.fuel } : {}),
    ...(f.transmission ? { transmission: f.transmission } : {}),
    ...(f.bodyType ? { bodyType: f.bodyType } : {}),
    ...(f.country ? { country: f.country } : {}),
    ...(f.location ? { location: { contains: f.location, mode: "insensitive" as const } } : {}),
  };

  const orderBy =
    f.sort === "price_asc"
      ? { price: "asc" as const }
      : f.sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { brand: true, images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return NextResponse.json({
    vehicles,
    pagination: {
      page: f.page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}
