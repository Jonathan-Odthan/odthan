import type { MetadataRoute } from "next";
import { prisma } from "@odthan/database";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://auto.odthan.com";
  const staticRoutes = ["", "/vehicules", "/recherche", "/marques", "/favoris", "/partenaires", "/devenir-partenaire", "/contact"];

  const [vehicles, brands] = await Promise.all([
    prisma.vehicle.findMany({ where: { active: true }, select: { slug: true } }),
    prisma.vehicleBrand.findMany({ select: { slug: true } }),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...vehicles.map((v) => ({
      url: `${base}/vehicules/${v.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...brands.map((b) => ({
      url: `${base}/marques/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
