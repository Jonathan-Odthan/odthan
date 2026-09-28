import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import ServiceForm from "../service-form";
import { createServiceAction } from "@/actions/services";

export default async function NewServicePage() {
  await requirePermission("services.create");
  return (
    <div>
      <PageHeader title="Nouveau service" />
      <ServiceForm action={createServiceAction} submitLabel="Creer le service" />
    </div>
  );
}
