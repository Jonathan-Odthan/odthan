import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import PageHeader from "@/components/ui/page-header";
import { createOrderAction } from "@/actions/orders";
import OrderForm from "./order-form";

export default async function NewOrderPage() {
  await requirePermission("orders.create");
  const [clients, agents, requests] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.profile.findMany({ where: { status: "ACTIVE" }, orderBy: { firstName: "asc" } }),
    prisma.request.findMany({ where: { order: null }, orderBy: { createdAt: "desc" }, take: 50, include: { client: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Nouvelle commande" />
      <OrderForm action={createOrderAction} clients={clients} agents={agents} requests={requests} />
    </div>
  );
}
