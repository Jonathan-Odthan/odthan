import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { createInvoiceAction } from "@/actions/invoices";
import InvoiceForm from "./invoice-form";

export default async function NewInvoicePage() {
  await requirePermission("invoices.create");
  const [clients, orders] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { client: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Nouvelle facture" />
      <InvoiceForm action={createInvoiceAction} clients={clients} orders={orders} />
    </div>
  );
}
