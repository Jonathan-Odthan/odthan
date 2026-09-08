import type { MetadataRoute } from "next";
import { prisma } from "@odthan/database";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://business.odthan.com";
  const staticRoutes = ["", "/creer-mon-entreprise", "/services", "/tarifs", "/comment-ca-marche", "/faq", "/contact"];

  const services = await prisma.businessService.findMany({ where: { active: true }, select: { slug: true } });

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
