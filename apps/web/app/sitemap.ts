import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.odthan.com";
  const routes = [
    "",
    "/a-propos",
    "/activites",
    "/partenaires",
    "/blog",
    "/contact",
    "/faq",
    "/connexion",
    "/inscription",
    "/confidentialite",
    "/conditions",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
