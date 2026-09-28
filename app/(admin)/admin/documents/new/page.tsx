import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { uploadDocumentAction } from "@/actions/documents";
import UploadForm from "./upload-form";

export default async function NewDocumentPage() {
  await requirePermission("documents.upload");
  const [clients, orders] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div>
      <PageHeader title="Ajouter un document" />
      <UploadForm action={uploadDocumentAction} clients={clients} orders={orders} />
    </div>
  );
}
