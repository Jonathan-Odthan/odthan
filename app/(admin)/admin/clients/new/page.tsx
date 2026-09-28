import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import ClientForm from "../client-form";
import { createClientAction } from "@/actions/clients";

export const metadata = { title: "Nouveau client" };

export default async function NewClientPage() {
  await requirePermission("clients.create");
  return (
    <div>
      <PageHeader title="Nouveau client" />
      <ClientForm action={createClientAction} submitLabel="Creer le client" />
    </div>
  );
}
