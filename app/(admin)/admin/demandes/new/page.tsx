import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { createRequestAction } from "@/actions/requests";
import RequestForm from "./request-form";

export default async function NewRequestPage() {
  await requirePermission("requests.create");
  const [clients, services, agents] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.service.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.profile.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Nouvelle demande" />
      <RequestForm action={createRequestAction} clients={clients} services={services} agents={agents} />
    </div>
  );
}
