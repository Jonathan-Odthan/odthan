/**
 * ODTHAN — Seed de démonstration.
 * Toutes les données créées ici sont des DONNÉES DE DÉMONSTRATION.
 * Ne jamais utiliser ce script pour créer des comptes admin en production.
 */
import { PrismaClient, RoleName } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seed ODTHAN : démarrage...");

  // ---- Rôles ----
  const roleNames: RoleName[] = [
    "USER",
    "CLIENT",
    "AFFILIATE",
    "INVESTOR",
    "PARTNER",
    "ADMIN",
    "SUPER_ADMIN",
  ];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("  ✓ Rôles créés");

  // ---- Utilisateur admin de démo (mot de passe fort, à changer immédiatement) ----
  // ATTENTION : en production, ne jamais garder ce compte tel quel.
  const demoPasswordHash = await hash("ChangeMe!Demo#2026", 12);
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });

  const adminUser = await prisma.user.upsert({
    where: { email: "demo-admin@odthan.com" },
    update: {},
    create: {
      email: "demo-admin@odthan.com",
      passwordHash: demoPasswordHash,
      profile: {
        create: {
          firstName: "Demo",
          lastName: "Admin",
          language: "fr",
          currency: "USD",
        },
      },
      roles: {
        create: { roleId: adminRole.id },
      },
    },
  });
  console.log("  ✓ Utilisateur admin de démonstration créé:", adminUser.email);

  // ---- Marques automobiles ----
  const brandNames = ["Toyota", "BMW", "Mercedes-Benz", "Hyundai", "Kia", "Honda"];
  const brands = [];
  for (const name of brandNames) {
    const brand = await prisma.vehicleBrand.upsert({
      where: { slug: name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      },
    });
    brands.push(brand);
  }
  console.log("  ✓ Marques automobiles créées:", brands.map((b) => b.name).join(", "));

  // ---- Véhicules de démonstration ----
  const demoVehicles = [
    { brand: "Toyota", name: "RAV4 2025", year: 2025, price: 32000, mileage: 5000, fuel: "Hybride", transmission: "Automatique", bodyType: "SUV", location: "Port-au-Prince", country: "Haïti" },
    { brand: "BMW", name: "Série 3 2024", year: 2024, price: 41000, mileage: 12000, fuel: "Essence", transmission: "Automatique", bodyType: "Berline", location: "Santo Domingo", country: "République Dominicaine" },
    { brand: "Honda", name: "CR-V 2023", year: 2023, price: 27500, mileage: 20000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", location: "Miami", country: "USA" },
    { brand: "Hyundai", name: "Tucson 2024", year: 2024, price: 26000, mileage: 8000, fuel: "Essence", transmission: "Automatique", bodyType: "SUV", location: "Cap-Haïtien", country: "Haïti" },
  ];

  for (const v of demoVehicles) {
    const brand = brands.find((b) => b.name === v.brand)!;
    const slug = `${v.brand.toLowerCase()}-${v.name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.vehicle.upsert({
      where: { slug },
      update: {},
      create: {
        brandId: brand.id,
        name: v.name,
        slug,
        year: v.year,
        price: v.price,
        currency: "USD",
        mileage: v.mileage,
        fuel: v.fuel,
        transmission: v.transmission,
        bodyType: v.bodyType,
        location: v.location,
        country: v.country,
        description: `${v.name} en excellent état — données de démonstration ODTHAN AUTO.`,
        active: true,
      },
    });
  }
  console.log("  ✓ Véhicules de démonstration créés");

  // ---- Services Business ----
  const services = [
    { name: "Création d'entreprise", price: 250 },
    { name: "Logo", price: 80 },
    { name: "Site web", price: 600 },
    { name: "Boutique en ligne", price: 900 },
    { name: "Présence en ligne", price: 150 },
    { name: "SEO", price: 200 },
    { name: "Marketing digital", price: 300 },
    { name: "Identité visuelle", price: 220 },
  ];
  for (const [i, s] of services.entries()) {
    const slug = s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    await prisma.businessService.upsert({
      where: { slug },
      update: {},
      create: {
        name: s.name,
        slug,
        description: `Service ${s.name} proposé par ODTHAN BUSINESS.`,
        price: s.price,
        currency: "USD",
        active: true,
        order: i,
      },
    });
  }
  console.log("  ✓ Services Business créés");

  // ---- Opportunité d'investissement (désactivée par défaut) ----
  await prisma.investmentOpportunity.upsert({
    where: { slug: "opportunite-demo-2026" },
    update: {},
    create: {
      title: "Opportunité de démonstration 2026",
      slug: "opportunite-demo-2026",
      description:
        "Exemple d'opportunité d'investissement. Ceci est une donnée de démonstration, inactive par défaut. Aucune collecte réelle de fonds ne doit être activée sans validation juridique et réglementaire préalable.",
      minimum: 500,
      currency: "USD",
      termMonths: 12,
      target: 100000,
      active: false,
    },
  });
  console.log("  ✓ Opportunité d'investissement de démonstration créée (inactive)");

  // ---- Paramètres par défaut ----
  await prisma.setting.upsert({
    where: { key: "company" },
    update: {},
    create: {
      key: "company",
      value: {
        name: "ODTHAN",
        slogan: "Construire. Investir. Développer.",
        email: "contact@odthan.com",
        defaultCurrency: "USD",
        defaultLanguage: "fr",
      },
    },
  });
  console.log("  ✓ Paramètres par défaut créés");

  // ---- FAQ de démonstration ----
  const faqs = [
    { question: "Comment créer un compte ODTHAN ?", answer: "Rendez-vous sur la page d'inscription de www.odthan.com et remplissez le formulaire.", category: "general" },
    { question: "Un seul compte suffit-il pour toutes les activités ?", answer: "Oui, votre compte ODTHAN central donne accès à Business, Auto et Investir.", category: "general" },
    { question: "Combien coûte la création d'une entreprise ?", answer: "Les tarifs varient selon les services choisis. Consultez la page Tarifs de ODTHAN BUSINESS.", category: "business" },
    { question: "Comment devenir affilié automobile ?", answer: "Connectez-vous puis rendez-vous sur /account/affiliate sur auto.odthan.com pour générer votre code.", category: "auto" },
    { question: "Les rendements d'investissement sont-ils garantis ?", answer: "Non. Aucun rendement n'est garanti et ODTHAN n'est pas un établissement financier réglementé.", category: "investir" },
  ];
  for (const [i, f] of faqs.entries()) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: { ...f, order: i } });
    }
  }
  console.log("  ✓ FAQ de démonstration créées");

  // ---- Témoignages de démonstration ----
  const testimonials = [
    { authorName: "Client démonstration 1", role: "Entrepreneur", content: "Exemple de témoignage — donnée de démonstration.", rating: 5 },
    { authorName: "Client démonstration 2", role: "Investisseur", content: "Exemple de témoignage — donnée de démonstration.", rating: 5 },
  ];
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, approved: true } });
    }
  }
  console.log("  ✓ Témoignages de démonstration créés");

  // ---- Article de blog de démonstration ----
  await prisma.blogPost.upsert({
    where: { slug: "bienvenue-sur-odthan" },
    update: {},
    create: {
      title: "Bienvenue sur ODTHAN",
      slug: "bienvenue-sur-odthan",
      excerpt: "Découvrez l'écosystème digital ODTHAN et ses trois activités.",
      content:
        "ODTHAN réunit entrepreneuriat, automobile et investissement au sein d'une même plateforme. Ceci est un article de démonstration.",
      published: true,
      publishedAt: new Date(),
      seoTitle: "Bienvenue sur ODTHAN",
      seoDescription: "Découvrez l'écosystème digital ODTHAN.",
    },
  });
  console.log("  ✓ Article de blog de démonstration créé");

  console.log("→ Seed ODTHAN : terminé avec succès.");
}

main()
  .catch((e) => {
    console.error("Erreur pendant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
