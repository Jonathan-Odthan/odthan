import type { MetadataRoute } from "next";
import { prisma } from "@odthan/database";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://investir.odthan.com";
  const staticRoutes = ["", "/opportunites", "/calculateur", "/comment-ca-marche", "/faq", "/contact"];

  const opportunities = await prisma.investmentOpportunity.findMany({
    where: { active: true },
    select: { slug: true },
  });

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...opportunities.map((o) => ({
      url: `${base}/opportunites/${o.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
