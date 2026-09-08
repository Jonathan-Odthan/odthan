import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true,
      images: { orderBy: { order: "asc" } },
      partners: true,
    },
  });

  if (!vehicle || !vehicle.active) {
    return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
  }

  return NextResponse.json({ vehicle });
}
