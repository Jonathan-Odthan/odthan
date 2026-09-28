import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/page-header";
import ClientForm from "../../client-form";
import { updateClientAction } from "@/actions/clients";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  await requirePermission("clients.update");
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const action = updateClientAction.bind(null, client.id);

  return (
    <div>
      <PageHeader title={`Modifier ${client.firstName} ${client.lastName}`} />
      <ClientForm
        action={action}
        submitLabel="Enregistrer"
        defaultValues={{
          firstName: client.firstName,
          lastName: client.lastName,
          company: client.company || "",
          email: client.email || "",
          phone: client.phone || "",
          whatsapp: client.whatsapp || "",
          address: client.address || "",
          country: client.country || "",
          city: client.city || "",
          status: client.status,
          notes: client.notes || "",
        }}
      />
    </div>
  );
}
