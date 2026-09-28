"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { orderSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { generateNumber } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type FormState = { error?: string } | null;

export async function createOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("orders.create");
  const parsed = orderSchema.safeParse({
    clientId: formData.get("clientId"),
    requestId: formData.get("requestId") || "",
    amount: formData.get("amount"),
    assigneeId: formData.get("assigneeId") || "",
    dueDate: formData.get("dueDate") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const { requestId, assigneeId, dueDate, ...data } = parsed.data;

  const order = await prisma.order.create({
    data: {
      ...data,
      number: generateNumber("ORD"),
      requestId: requestId || undefined,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      history: { create: { status: "PENDING", note: "Commande creee" } },
    },
  });

  await logAudit({ profileId: profile?.id, action: "CREATE_ORDER", module: "orders", targetId: order.id });
  revalidatePath("/admin/commandes");
  redirect(`/admin/commandes/${order.id}`);
}

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "WAITING_PAYMENT", "WAITING_CLIENT", "COMPLETED", "CANCELLED"]),
  note: z.string().optional().or(z.literal("")),
});

export async function updateOrderStatusAction(orderId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("orders.update");
  const parsed = statusSchema.safeParse({ status: formData.get("status"), note: formData.get("note") || "" });
  if (!parsed.success) return { error: "Statut invalide." };

  const profile = await getCurrentProfile();
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: parsed.data.status } }),
    prisma.orderHistory.create({ data: { orderId, status: parsed.data.status, note: parsed.data.note || null } }),
  ]);

  await logAudit({ profileId: profile?.id, action: "UPDATE_ORDER", module: "orders", targetId: orderId, metadata: { status: parsed.data.status } });
  revalidatePath(`/admin/commandes/${orderId}`);
  revalidatePath("/admin/commandes");
  return null;
}
