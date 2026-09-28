"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { serviceSchema } from "@/lib/validation/schemas";
import { logAudit } from "@/lib/security/audit";
import { getCurrentProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

function parse(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    categoryId: formData.get("categoryId") || "",
    status: formData.get("status") || "ACTIVE",
  });
}

export async function createServiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("services.create");
  const parsed = parse(formData);
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const { categoryId, ...data } = parsed.data;
  const service = await prisma.service.create({
    data: { ...data, categoryId: categoryId || undefined },
  });
  await logAudit({ profileId: profile?.id, action: "CREATE_SERVICE", module: "services", targetId: service.id });

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateServiceAction(serviceId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("services.update");
  const parsed = parse(formData);
  if (!parsed.success) return { error: "Verifiez les champs du formulaire." };

  const profile = await getCurrentProfile();
  const { categoryId, ...data } = parsed.data;
  await prisma.service.update({ where: { id: serviceId }, data: { ...data, categoryId: categoryId || null } });
  await logAudit({ profileId: profile?.id, action: "UPDATE_SERVICE", module: "services", targetId: serviceId });

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function toggleServiceStatusAction(serviceId: string, nextStatus: "ACTIVE" | "INACTIVE") {
  await requirePermission("services.update");
  const profile = await getCurrentProfile();
  await prisma.service.update({ where: { id: serviceId }, data: { status: nextStatus } });
  await logAudit({ profileId: profile?.id, action: "UPDATE_SERVICE", module: "services", targetId: serviceId, metadata: { status: nextStatus } });
  revalidatePath("/admin/services");
}
