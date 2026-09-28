import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { createPaymentAction } from "@/actions/payments";
import PaymentForm from "./payment-form";

export default async function NewPaymentPage() {
  await requirePermission("payments.create");
  const [clients, orders] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.order.findMany({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }, orderBy: { createdAt: "desc" }, take: 100, include: { client: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Enregistrer un paiement" />
      <PaymentForm action={createPaymentAction} clients={clients} orders={orders} />
    </div>
  );
}
