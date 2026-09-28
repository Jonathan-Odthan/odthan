import { PrismaClient } from "@prisma/client";
import { PERMISSIONS_CATALOG, ROLE_DEFAULTS } from "./permissions-catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed: permissions...");
  for (const p of PERMISSIONS_CATALOG) {
    await prisma.permission.upsert({ where: { key: p.key }, update: { module: p.module, label: p.label }, create: p });
  }

  console.log("Seed: roles...");
  await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", label: "Super Administrateur", description: "Acces complet et implicite a tous les modules." },
  });

  for (const roleDef of ROLE_DEFAULTS) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { label: roleDef.label },
      create: { name: roleDef.name, label: roleDef.label },
    });

    const permissions = await prisma.permission.findMany({ where: { key: { in: roleDef.permissions } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }

  console.log("Seed: categories de services...");
  const category = await prisma.serviceCategory.upsert({
    where: { name: "Creation d'entreprise" },
    update: {},
    create: { name: "Creation d'entreprise" },
  });

  console.log("Seed: services Odthan de base...");
  const baseServices = [
    "Creation d'entreprise de zero",
    "Creation de site web",
    "Boutique en ligne",
    "Creation de page Facebook",
    "Creation de page Instagram",
    "Google Business Profile",
    "SEO / referencement",
    "Identite visuelle",
    "Nom de domaine",
    "Reservation / enregistrement du nom commercial",
  ];
  for (const name of baseServices) {
    const existing = await prisma.service.findFirst({ where: { name } });
    if (!existing) {
      await prisma.service.create({ data: { name, price: 0, categoryId: category.id, status: "ACTIVE" } });
    }
  }

  console.log("Seed termine. Aucun compte utilisateur cree ici : utilisez `npm run create-super-admin`.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
