"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { paymentSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { generateNumber } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createPaymentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("payments.create");
  const parsed = paymentSchema.safeParse({
    clientId: formData.get("clientId"),
    orderId: formData.get("orderId") || "",
    amount: formData.get("amount"),
    currency: formData.get("currency") || "HTG",
    method: formData.get("method"),
    reference: formData.get("reference") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const { orderId, ...data } = parsed.data;

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: { ...data, orderId: orderId || undefined, number: generateNumber("PAY"), status: "CONFIRMED" },
    });

    if (orderId) {
      await tx.order.update({ where: { id: orderId }, data: { amountPaid: { increment: data.amount } } });
    }

    return created;
  });

  await logAudit({ profileId: profile?.id, action: "PAYMENT_CREATED", module: "payments", targetId: payment.id });
  revalidatePath("/admin/paiements");
  if (orderId) revalidatePath(`/admin/commandes/${orderId}`);
  redirect("/admin/paiements");
}
