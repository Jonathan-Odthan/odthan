import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import ServiceForm from "../../service-form";
import { updateServiceAction } from "@/actions/services";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  await requirePermission("services.update");
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) notFound();
  const action = updateServiceAction.bind(null, service.id);

  return (
    <div>
      <PageHeader title={`Modifier ${service.name}`} />
      <ServiceForm
        action={action}
        submitLabel="Enregistrer"
        defaultValues={{
          name: service.name,
          description: service.description || "",
          price: String(service.price),
          status: service.status,
        }}
      />
    </div>
  );
}
