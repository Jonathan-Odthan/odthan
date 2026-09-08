import { prisma } from "@odthan/database";
import { BusinessWizard } from "./BusinessWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Créer mon entreprise" };

export default async function CreerMonEntreprisePage() {
  const services = await prisma.businessService.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return <BusinessWizard availableServices={services} />;
}
