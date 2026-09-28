"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { generateNumber } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type FormState = { error?: string } | null;

const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  orderId: z.string().uuid().optional().or(z.literal("")),
  subtotal: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  dueDate: z.string().optional().or(z.literal("")),
});

export async function createInvoiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("invoices.create");
  const parsed = invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    orderId: formData.get("orderId") || "",
    subtotal: formData.get("subtotal"),
    discount: formData.get("discount") || 0,
    dueDate: formData.get("dueDate") || "",
  });
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const { orderId, dueDate, subtotal, discount, clientId } = parsed.data;
  const total = Math.max(0, subtotal - discount);
  const profile = await getCurrentProfile();

  const invoice = await prisma.invoice.create({
    data: {
      number: generateNumber("INV"),
      clientId,
      orderId: orderId || undefined,
      subtotal,
      discount,
      total,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: "DRAFT",
    },
  });

  await logAudit({ profileId: profile?.id, action: "CREATE_INVOICE", module: "invoices", targetId: invoice.id });
  revalidatePath("/admin/factures");
  redirect("/admin/factures");
}
